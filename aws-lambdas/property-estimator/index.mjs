import { Buffer } from 'buffer';

export const handler = async (event) => {
    console.log("Received property estimate request event:", JSON.stringify(event, null, 2));

    // Handle CORS preflight request
    if (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: "",
        };
    }

    try {
        const corelogicClientKey = process.env.CORELOGIC_CLIENT_KEY;
        const corelogicClientSecret = process.env.CORELOGIC_CLIENT_SECRET;

        if (!corelogicClientKey || !corelogicClientSecret) {
            console.error("CoreLogic client key or secret is not set.");
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Server configuration error: CoreLogic credentials missing." }),
            };
        }

        console.log("Attempting to get CoreLogic Access Token...");
        const encodedCredentials = Buffer
            .from(`${corelogicClientKey}:${corelogicClientSecret}`)
            .toString('base64')
            .replace(/\n/g, '');

        const tokenResponse = await fetch('https://api-prod.corelogic.com/oauth/token?grant_type=client_credentials', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${encodedCredentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        });

        const tokenData = await tokenResponse.json();
        console.log("CoreLogic Token Response:", tokenData);

        if (!tokenResponse.ok || !tokenData.access_token) {
            console.error("Failed to obtain CoreLogic access token:", tokenData);
            return {
                statusCode: tokenResponse.status || 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Failed to obtain CoreLogic access token", details: tokenData }),
            };
        }

        const accessToken = tokenData.access_token;

        // Parse request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body);
        } catch (parseError) {
            console.error("Error parsing request body:", parseError);
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Invalid JSON in request body." }),
            };
        }

        const { streetAddress, zipcode } = requestBody;

        if (!streetAddress || !zipcode) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Missing streetAddress or zipcode in request body." }),
            };
        }

        // Search property
        console.log(`Searching CoreLogic for property: ${streetAddress}, ${zipcode}`);
        const propertySearchResponse = await fetch(`https://api-prod.corelogic.com/property?address=${encodeURIComponent(streetAddress)}&zip5=${encodeURIComponent(zipcode)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/vnd.corelogic.v1+json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        const propertyData = await propertySearchResponse.json();
        console.log("CoreLogic Property Search Response:", propertyData);

        if (!propertySearchResponse.ok || !propertyData.data || propertyData.data.length === 0) {
            console.error("Failed to find property:", propertyData);
            return {
                statusCode: propertySearchResponse.status || 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Could not find property or invalid response from CoreLogic.", details: propertyData }),
            };
        }

        const foundProperty = propertyData.data[0];
        const corelogicPropertyId = foundProperty.corelogicPropertyId;

        if (!corelogicPropertyId) {
            console.error("Missing corelogicPropertyId:", foundProperty);
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Could not retrieve property ID for valuation." }),
            };
        }

        // Try valuation endpoint
        const valuationEndpoints = [
            `https://api-prod.corelogic.com/property/${corelogicPropertyId}/avm/thv/thvConsumers/summary`,
             // fallback
        ];

        let valuationData = null;
        let valuationStatus = null;

        for (const endpoint of valuationEndpoints) {
            console.log(`Fetching valuation from: ${endpoint}`);
            const valuationResponse = await fetch(endpoint, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/vnd.corelogic.v1+json',
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            valuationStatus = valuationResponse.status;
            const valuationHeaders = Object.fromEntries(valuationResponse.headers.entries());
            console.log("Valuation status:", valuationStatus);
            console.log("Valuation headers:", valuationHeaders);

            const responseData = await valuationResponse.json();
            console.log("CoreLogic Valuation Response:", responseData);

            if (valuationResponse.ok && responseData.summary?.estimatedValue) {
                valuationData = responseData;
                break;
            }

            console.warn("Valuation fetch failed or missing data, trying next if available.");
        }

        if (!valuationData || !valuationData.summary?.estimatedValue) {
            return {
                statusCode: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "Property found but valuation not available.",
                    propertyAddress: foundProperty.propertyAddress,
                    clip: foundProperty.clip || foundProperty.universalParcelId,
                    v1PropertyId: foundProperty.v1PropertyId || foundProperty.corelogicPropertyId,
                }),
            };
        }

        // Successful valuation
        const responseBody = {
            priceEstimate: `$${valuationData.summary.estimatedValue.toLocaleString()}`,
            lowEstimate: `$${valuationData.summary.lowValue.toLocaleString()}`,
            highEstimate: `$${valuationData.summary.highValue.toLocaleString()}`,
            valuationDate: valuationData.summary.processedDate,
            propertyAddress: foundProperty.propertyAddress,
            clip: foundProperty.clip || foundProperty.universalParcelId,
            v1PropertyId: foundProperty.v1PropertyId || foundProperty.corelogicPropertyId,
            message: "Property found and valuation retrieved."
        };

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(responseBody),
        };

    } catch (error) {
        console.error("Error in Property Estimator Lambda function:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};
 
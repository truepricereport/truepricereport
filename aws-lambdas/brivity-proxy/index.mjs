import { Buffer } from 'buffer';

export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    // Handle CORS preflight request
    if (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // Or your specific frontend URL
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: "",
        };
    }

    try {
        // Retrieve Brivity API Token and Primary Agent ID from Lambda environment variables
        const brivityApiToken = process.env.BRIVITY_API_TOKEN;
        const brivityPrimaryAgentId = process.env.BRIVITY_PRIMARY_AGENT_ID;

        if (!brivityApiToken) {
            console.error("BRIVITY_API_TOKEN is not set in Lambda environment variables.");
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Server configuration error: Brivity API token missing." }),
            };
        }

        if (!brivityPrimaryAgentId) {
            console.error("BRIVITY_PRIMARY_AGENT_ID is not set in Lambda environment variables.");
            return {
                statusCode: 500,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: "Server configuration error: Brivity Primary Agent ID missing." }),
            };
        }

        let requestBody;
        try {
            if (event.isBase64Encoded) {
                requestBody = JSON.parse(Buffer.from(event.body, 'base64').toString('utf8'));
            } else {
                requestBody = JSON.parse(event.body);
            }
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

        // Add/override primary_agent_id from Lambda environment if it's not present or needs to be forced
        // Otherwise, allow it to come from the frontend if it's there
        requestBody.primary_agent_id = parseInt(brivityPrimaryAgentId, 10);
        
        console.log("Forwarding payload to Brivity:", requestBody);

        const brivityResponse = await fetch('https://secure.brivity.com/api/v2/leads', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Token token=${brivityApiToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        const brivityData = await brivityResponse.json();
        console.log("Response from Brivity:", brivityData);

        return {
            statusCode: brivityResponse.status,
            headers: {
                "Access-Control-Allow-Origin": "*", // Allow all origins for simplicity in development
                "Content-Type": "application/json",
            },
            body: JSON.stringify(brivityData),
        };

    } catch (error) {
        console.error("Error in Lambda function:", error);
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

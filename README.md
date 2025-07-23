This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


## Brivity API Integration Notes

This project integrates with the Brivity CRM API to create and update leads. Due to browser security restrictions (Same-Origin Policy and CORS), direct API calls from the client-side to `https://secure.brivity.com` will fail with a "No 'Access-Control-Allow-Origin' header" error.

**Reason for AWS API Gateway + Lambda Proxy:**
To circumvent the CORS issue, a server-side proxy is required. Your frontend will make requests to an AWS API Gateway endpoint, which will then trigger an AWS Lambda function. This Lambda function will forward the request to the Brivity API. Since server-to-server communication is not subject to browser CORS policies, the request will succeed. This also enhances security by keeping your sensitive Brivity API token off the client-side.

**Current Implementation Status:**
The frontend code is set up to interact with this proxy. The Brivity API calls in `src/components/MainFlow.tsx` are now configured to hit your AWS API Gateway endpoint.

**Environment Variables:**

You**Frontend Environment Variables** (to be placed in `.env.local` in your project root):

```
# The URL of your AWS API Gateway endpoint that proxies to Brivity.
# This is the URL your frontend will make requests to.
NEXT_PUBLIC_AWS_API_GATEWAY_URL=https://ok333mxmd3.execute-api.us-west-1.amazonaws.com/default/newlead

# Your Brivity Primary Agent ID.
# This ID will be included in the payload sent from your frontend to the AWS proxy.
NEXT_PUBLIC_BRIVITY_PRIMARY_AGENT_ID=244059
```

**AWS Lambda Environment Variables** (to be configured directly on your Lambda function in the AWS console):

```
# Your Brivity API Token.
# This sensitive token must NOT be exposed in frontend code. It's used by your Lambda to authenticate with Brivity.
BRIVITY_API_TOKEN=your_brivity_api_token_here

# Your Brivity Primary Agent ID.
# While also sent from the frontend, the Lambda also uses this for its internal logic/validation if needed,
# or as a fallback/override for the agent ID used in the Brivity API call.
BRIVITY_PRIMARY_AGENT_ID=244059
```

**Steps to Set Up AWS Proxy (for Production Integration):**

1.  **Create an AWS Lambda Function:**
    *   **File Location:** Create a new directory `aws-lambdas/brivity-proxy/` and inside it, an `index.mjs` file.
    *   **Runtime:** Node.js
    *   **Purpose:** This Lambda function will receive the request from API Gateway.
    *   **Logic:** It will extract the request body, construct the `POST` request to `https://secure.brivity.com/api/v2/leads`. It must include the `Authorization: Token token=process.env.BRIVITY_API_TOKEN` header (note: `BRIVITY_API_TOKEN` will be an environment variable configured directly on the Lambda, not `NEXT_PUBLIC_...`). It will also include the `primary_agent_id` passed from your frontend.
    *   **CORS:** **Crucially, your Lambda's response must include CORS headers** (e.g., `Access-Control-Allow-Origin: *` or your specific frontend origin, and `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`) so API Gateway can pass them back to your browser.

    *Example `aws-lambdas/brivity-proxy/index.mjs` structure:*
    ```javascript
    import { Buffer } from 'buffer';

    export const handler = async (event) => {
        console.log("Received event:", JSON.stringify(event, null, 2));

        if (event.requestContext && event.requestContext.http && event.requestContext.http.method === 'OPTIONS') {
            // Respond to CORS preflight request
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
            const brivityApiToken = process.env.BRIVITY_API_TOKEN; // Get from Lambda environment variables
            const brivityPrimaryAgentId = process.env.BRIVITY_PRIMARY_AGENT_ID; // Get from Lambda environment variables

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
            if (event.isBase64Encoded) {
                requestBody = JSON.parse(Buffer.from(event.body, 'base64').toString('utf8'));
            } else {
                requestBody = JSON.parse(event.body);
            }

            // Ensure primary_agent_id is set in the payload, prioritizing Lambda env var if needed
            // This line ensures the Lambda's configured agent ID is always used for the Brivity call
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
    ```

2.  **Create an AWS API Gateway:**
    *   Your API Gateway `newLead-API` with endpoint `https://ok333mxmd3.execute-api.us-west-1.amazonaws.com/default/newlead` is already set up.
    *   Ensure its `/newlead` resource has a `POST` method integrated with your Lambda function.
    *   **Crucial:** Ensure CORS is enabled on this API Gateway resource/method. API Gateway will add the `Access-Control-Allow-Origin` header (and others) based on its configuration, but it's good practice for the Lambda to also return them.

3.  **Deploy API Gateway:** Once your Lambda is updated and integrated, deploy your API Gateway changes. Your frontend should then be able to make live calls.

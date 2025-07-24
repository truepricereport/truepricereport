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


## API Integration Notes

This project integrates with external APIs (Brivity CRM and CoreLogic for property data) via AWS Lambda proxies to bypass browser security restrictions (Same-Origin Policy and CORS). This architecture ensures that sensitive API keys are never exposed on the client-side.

**Architecture Overview:**
Your frontend makes requests to AWS API Gateway endpoints. These endpoints trigger specific AWS Lambda functions. The Lambda functions then securely interact with the respective third-party APIs (Brivity or CoreLogic) and return the response back through API Gateway to your frontend.

**Current Implementation Status:**

*   **Brivity CRM Integration:** The frontend is configured to send lead data (after Step 3 submission and Result Page updates) to an AWS API Gateway endpoint, which proxies to the Brivity API.
*   **CoreLogic Property Estimator:** The frontend is configured to send address data (after Step 1 confirmation) to a separate AWS API Gateway endpoint, which proxies to the CoreLogic API to fetch property details and a price estimate.

**Environment Variables:**

**Frontend Environment Variables** (to be placed in `.env.local` in your project root):

```
# The URL of your AWS API Gateway endpoint that proxies to Brivity.
# This is the URL your frontend will make requests to for lead creation/updates.
NEXT_PUBLIC_AWS_API_GATEWAY_URL=https://ok333mxmd3.execute-api.us-west-1.amazonaws.com/default/newlead

# The URL of your AWS API Gateway endpoint that proxies to CoreLogic for property estimation.
# This is the URL your frontend will make requests to for property data.
NEXT_PUBLIC_CORELOGIC_API_GATEWAY_URL=https://1268av7s21.execute-api.us-west-1.amazonaws.com/default/propertyestimator
```

**AWS Lambda Environment Variables** (to be configured directly on your respective Lambda functions in the AWS console):

```
# --- For Brivity Proxy Lambda (brivity-proxy) ---
# Your Brivity API Token.
# This sensitive token must NOT be exposed in frontend code. It's used by your Lambda to authenticate with Brivity.
BRIVITY_API_TOKEN=your_brivity_api_token_here

# Your Brivity Primary Agent ID.
# This ID is securely injected into the Brivity API payload by your Lambda function.
BRIVITY_PRIMARY_AGENT_ID=244059

# --- For CoreLogic Property Estimator Lambda (property-estimator) ---
# Your CoreLogic Client Key.
CORELOGIC_CLIENT_KEY=your_corelogic_client_key_here

# Your CoreLogic Client Secret.
CORELOGIC_CLIENT_SECRET=your_corelogic_client_secret_here
```

**Steps to Set Up AWS Proxies (for Production Integration):**

### 1. Brivity Lead Proxy Lambda (`aws-lambdas/brivity-proxy/index.mjs`)

*   **File Location:** `aws-lambdas/brivity-proxy/index.mjs`
*   **Runtime:** Node.js
*   **Logic:** This Lambda acts as a secure intermediary for Brivity CRM. It receives the JSON payload from your frontend via API Gateway. It then securely retrieves your `BRIVITY_API_TOKEN` and `BRIVITY_PRIMARY_AGENT_ID` from its own environment variables, injects the `primary_agent_id` into the payload, and forwards the complete request to the Brivity API. Finally, it returns Brivity's response back to your frontend.
*   **CORS:** **Crucially, your Lambda's response must include CORS headers** (e.g., `Access-Control-Allow-Origin: *` or your specific frontend origin, and `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`) so API Gateway can pass them back to your browser.

### 2. CoreLogic Property Estimator Lambda (`aws-lambdas/property-estimator/index.mjs`)

*   **File Location:** `aws-lambdas/property-estimator/index.mjs`
*   **Runtime:** Node.js
*   **Logic:** This Lambda acts as a secure intermediary for CoreLogic property data. It receives address details (street address, zipcode) from your frontend via API Gateway. It then securely uses its `CORELOGIC_CLIENT_KEY` and `CORELOGIC_CLIENT_SECRET` environment variables to first obtain an OAuth `access_token` from CoreLogic. Subsequently, it uses this `access_token` to call the CoreLogic Property Search API with the provided address. It returns the found property details (including a simulated price estimate for now) back to your frontend.
*   **CORS:** **Crucially, your Lambda's response must include CORS headers** (e.g., `Access-Control-Allow-Origin: *` or your specific frontend origin, and `Access-Control-Allow-Headers`, `Access-Control-Allow-Methods`) so API Gateway can pass them back to your browser.

### 3. AWS API Gateway Configuration

*   **Brivity API Gateway (`newLead-API`):**
    *   Endpoint: `https://ok333mxmd3.execute-api.us-west-1.amazonaws.com/default/newlead`
    *   Ensure its `/newlead` resource has a `POST` method integrated with your `brivity-proxy` Lambda function.
    *   **Crucial:** Ensure CORS is enabled on this API Gateway method/resource.

*   **CoreLogic Property Estimator API Gateway (`property-estimator-API`):**
    *   Endpoint: `https://1268av7s21.execute-api.us-west-1.amazonaws.com/default/propertyestimator`
    *   Ensure its `/propertyestimator` resource has a `POST` method integrated with your `property-estimator` Lambda function.
    *   **Crucial:** Ensure CORS is enabled on this API Gateway method/resource.

### 4. Deploying Your AWS Setup

Once your Lambda functions are updated with their respective code and environment variables, and API Gateway resources are correctly integrated, deploy your API Gateway changes. Your frontend should then be able to make live calls to both services.

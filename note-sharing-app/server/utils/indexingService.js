const { google } = require('googleapis');

// Use a variable to hold the JSON content string from Render environment
const KEY_CONTENT = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_CONTENT; 

// Base URL for your Netlify site (public domain)
const BASE_URL = 'https://peernotez.netlify.app';

// Function to get the JWT client authenticated for the Indexing API scope
const getAuthClient = async () => {
    // Check if the content is available
    if (!KEY_CONTENT) {
        // Warning will be logged, but we avoid crashing by letting the function exit gracefully
        console.error("Authentication failed: GOOGLE_SERVICE_ACCOUNT_KEY_CONTENT not found.");
        throw new Error("Missing Google Service Account key content.");
    }
    
    // Auth client uses the raw JSON object from the environment variable
    const auth = new google.auth.GoogleAuth({
        // Uses the key content string parsed into a JavaScript object
        credentials: JSON.parse(KEY_CONTENT), 
        scopes: ['https://www.googleapis.com/auth/indexing'],
    });
    return auth.getClient();
};

/**
 * Sends a notification to Google to update or delete a URL.
 * @param {string} slugOrId - The slug (for blog) or ID (for note).
 * @param {('URL_UPDATED'|'URL_DELETED')} type - The notification type.
 * @param {('blog'|'note')} contentType - Type of content to construct the URL.
 */
const sendIndexingRequest = async (slugOrId, type, contentType) => {
    // Fail safe: only run if the key content is present
    if (!KEY_CONTENT) {
        console.warn("Indexing API skipped: GOOGLE_SERVICE_ACCOUNT_KEY_CONTENT not set.");
        return;
    }

    const path = contentType === 'blog' ? `/blogs/${slugOrId}` : `/view/${slugOrId}`;
    const url = `${BASE_URL}${path}`;

    try {
        const authClient = await getAuthClient();
        const client = google.indexing({ version: 'v3', auth: authClient });
        
        const requestBody = { 
            url: url,
            type: type, // 'URL_UPDATED' or 'URL_DELETED'
        };

        // CRITICAL FIX: The Indexing API expects the body via the 'resource' parameter, 
        // not wrapped in 'request'. This fixes the 400 Invalid JSON Payload error.
        const response = await client.urlNotifications.publish({ 
            resource: requestBody 
        });
        
        console.log(`Indexing API successful: ${type} for ${url}. Status: ${response.status}`);
        return response.data;

    } catch (error) {
        // Log the error detail for debugging Render/Service Account setup issues.
        console.error(`Indexing API FAILED for ${url} (${type}):`, error.response ? error.response.data : error.message);
    }
};

module.exports = {
    urlUpdated: (slugOrId, contentType) => sendIndexingRequest(slugOrId, 'URL_UPDATED', contentType),
    urlDeleted: (slugOrId, contentType) => sendIndexingRequest(slugOrId, 'URL_DELETED', contentType),
};

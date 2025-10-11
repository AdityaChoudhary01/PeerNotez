const { google } = require('googleapis');

// CHANGE 1: Use a variable to hold the JSON content string
const KEY_CONTENT = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_CONTENT; 
// You can remove the KEY_FILE_PATH variable if you use this method exclusively.

// Base URL for your site, must be correct for canonical URLs
const BASE_URL = 'https://peernotez.netlify.app';

// Function to get the JWT client authenticated for the Indexing API scope
const getAuthClient = async () => {
    // Check if the content is available
    if (!KEY_CONTENT) {
        console.error("Authentication failed: GOOGLE_SERVICE_ACCOUNT_KEY_CONTENT not found.");
        throw new Error("Missing Google Service Account key content.");
    }
    
    // CHANGE 2: Use the 'credentials' property and parse the JSON string
    const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(KEY_CONTENT), // This parses the string back into a JS object
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
        
        const request = {
            url: url,
            type: type, 
        };

        const response = await client.urlNotifications.publish({ request });
        
        console.log(`Indexing API successful: ${type} for ${url}. Status: ${response.status}`);
        return response.data;

    } catch (error) {
        console.error(`Indexing API FAILED for ${url} (${type}):`, error.response ? error.response.data : error.message);
    }
};

module.exports = {
    urlUpdated: (slugOrId, contentType) => sendIndexingRequest(slugOrId, 'URL_UPDATED', contentType),
    urlDeleted: (slugOrId, contentType) => sendIndexingRequest(slugOrId, 'URL_DELETED', contentType),
};

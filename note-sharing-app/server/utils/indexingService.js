const { google } = require('googleapis');

// Configuration for the JWT Client
const jwtClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  scopes: ['https://www.googleapis.com/auth/indexing']
});

/**
 * Shared logic to publish notifications to Google Indexing API
 */
const publishToGoogle = async (urlID, type, actionType) => {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ SEO Error: Missing credentials in Environment Variables');
    return null;
  }

  try {
    await jwtClient.authorize();
    
    const baseUrl = 'https://peernotez.netlify.app';
    const targetUrl = type === 'note' 
        ? `${baseUrl}/view/${urlID}` 
        : `${baseUrl}/blogs/${urlID}`;

    const response = await google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: targetUrl,
        type: actionType, // URL_UPDATED or URL_DELETED
      },
    });

    console.log(`✅ SEO Success (${actionType}): Google notified for ${type}: ${targetUrl}`);
    return response.data;
  } catch (error) {
    console.error(`❌ SEO Error (${actionType}):`, error.message);
    return null; 
  }
};

// --- EXPORTED FUNCTIONS ---

// Call this for New Uploads or Edits
const urlUpdated = async (urlID, type) => {
  return await publishToGoogle(urlID, type, 'URL_UPDATED');
};

// Call this for Deletions
const urlDeleted = async (urlID, type) => {
  return await publishToGoogle(urlID, type, 'URL_DELETED');
};

module.exports = { 
  urlUpdated, 
  urlDeleted // Now this is available for your DELETE route
};

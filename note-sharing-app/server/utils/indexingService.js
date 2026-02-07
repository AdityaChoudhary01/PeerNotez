const { google } = require('googleapis');

// 1. Check if variables exist to prevent "undefined" errors
const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;

// 2. Optimized JWT Client setup
const jwtClient = new google.auth.JWT(
  clientEmail,
  null,
  privateKey ? privateKey.replace(/\\n/g, '\n') : null,
  ['https://www.googleapis.com/auth/indexing']
);

/**
 * Notifies Google that a URL has been updated or created.
 */
const urlUpdated = async (urlID, type) => {
  // CRITICAL: Check if credentials are loaded before attempting authorize
  if (!clientEmail || !privateKey) {
    console.error('SEO Error: Missing Google Credentials in .env');
    return;
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
        type: 'URL_UPDATED',
      },
    });

    console.log(`SEO Success: Google notified for ${type}: ${targetUrl}`);
    return response.data;
  } catch (error) {
    console.error('SEO Error: Google Indexing API failed:', error.message);
  }
};

const urlDeleted = async (urlID, type) => {
  if (!clientEmail || !privateKey) return;
  try {
    await jwtClient.authorize();
    const baseUrl = 'https://peernotez.netlify.app';
    const targetUrl = type === 'note' ? `${baseUrl}/view/${urlID}` : `${baseUrl}/blogs/${urlID}`;

    await google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: { url: targetUrl, type: 'URL_DELETED' },
    });
    console.log(`SEO Success: Google notified of deletion: ${targetUrl}`);
  } catch (error) {
    console.error('SEO Error:', error.message);
  }
};

module.exports = { urlUpdated, urlDeleted };

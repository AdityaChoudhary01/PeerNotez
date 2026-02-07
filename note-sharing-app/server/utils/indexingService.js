const { google } = require('googleapis');

// Construct the JWT client using environment variables
const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  null,
  // Fix for private key newline characters
  process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/indexing'],
  null
);

/**
 * Notifies Google that a URL has been updated or created.
 */
const urlUpdated = async (urlID, type) => {
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

/**
 * Notifies Google that a URL has been deleted.
 */
const urlDeleted = async (urlID, type) => {
  try {
    await jwtClient.authorize();
    const baseUrl = 'https://peernotez.netlify.app';
    const targetUrl = type === 'note' ? `${baseUrl}/view/${urlID}` : `${baseUrl}/blogs/${urlID}`;

    await google.indexing('v3').urlNotifications.publish({
      auth: jwtClient,
      requestBody: {
        url: targetUrl,
        type: 'URL_DELETED',
      },
    });
    console.log(`SEO Success: Google notified of deletion: ${targetUrl}`);
  } catch (error) {
    console.error('SEO Error:', error.message);
  }
};

module.exports = { urlUpdated, urlDeleted };

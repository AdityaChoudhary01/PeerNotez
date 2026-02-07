const { google } = require('googleapis');

// Use the constructor with a single configuration object
const jwtClient = new google.auth.JWT({
  email: process.env.GOOGLE_CLIENT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : null,
  scopes: ['https://www.googleapis.com/auth/indexing']
});

const urlUpdated = async (urlID, type) => {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.error('❌ SEO Error: Missing credentials in Environment Variables');
    return;
  }

  try {
    // This triggers the actual authentication
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

    console.log(`✅ SEO Success: Google notified for ${type}: ${targetUrl}`);
    return response.data;
  } catch (error) {
    console.error('❌ SEO Error:', error.message);
    // Return null so the calling function knows it failed but doesn't crash
    return null; 
  }
};

module.exports = { urlUpdated };

const express = require('express');
const router = express.Router();
// Import the Brevo SDK
const Brevo = require('@getbrevo/brevo');

// @route   POST /api/contact
// @desc    Send contact form email using Brevo Direct API Key
router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill out all fields.' });
  }

  // --- Brevo API Configuration ---
  const defaultClient = Brevo.ApiClient.instance;
  
  // Configure API key authorization: api-key
  // The API key is set directly in the authorization header.
  const apiKey = defaultClient.authentications['api-key'];
  // Use your Brevo API key (e.g., xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxx)
  apiKey.apiKey = process.env.BREVO_API_KEY; 

  // Create an instance of the TransactionalEmailsApi
  const apiInstance = new Brevo.TransactionalEmailsApi();

  // Create the email object
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  // 1. Sender (MUST be a verified sender email in your Brevo account)
  sendSmtpEmail.sender = { 
    name: process.env.BREVO_SENDER_NAME || "PeerNotez Contact Form", 
    email: process.env.BREVO_VERIFIED_SENDER_EMAIL 
  };

  // 2. Recipient (Your email address that receives the contact form)
  sendSmtpEmail.to = [{ 
    email: process.env.EMAIL_RECEIVER, 
    name: 'Contact Inbox' // Optional name for your receiving inbox
  }];

  // 3. Subject
  sendSmtpEmail.subject = `New Message from PeerNotez Contact Form`;
  
  // 4. Content (Using HTML is recommended, but we'll use a simple text content here)
  const htmlContent = `
    <html>
      <body>
        <p>You have a new message from the contact form:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </body>
    </html>
  `;
  sendSmtpEmail.htmlContent = htmlContent;
  
  // 5. Reply-To (Sets the reply-to header to the user's email)
  sendSmtpEmail.replyTo = { 
    email: email,
    name: name
  };


  // Send the email
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    // console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    res.status(200).json({ message: 'Message sent successfully!', brevoMessageId: data.messageId });
  } catch (error) {
    console.error('Error sending email via Brevo API:', error);
    // The Brevo SDK often wraps the error; checking for response body helps debug
    if (error.response && error.response.body) {
      console.error('Brevo API Error Response:', error.response.body);
    }
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();

// The Brevo SDK is now published under @getbrevo/brevo
// However, the original package name 'sib-api-v3-sdk' still works and is used here for consistency.
const SibApiV3Sdk = require('sib-api-v3-sdk'); 

// --- Brevo API Configuration (using direct API key) ---
// NOTE: We assume process.env.BREVO_API_KEY is set in the environment.

const defaultClient = SibApiV3Sdk.ApiClient.instance;
// Configure API key authorization: 'api-key' is the authentication scheme name
defaultClient.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// --- API Route for Contact Form ---
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, error: 'All fields are required.' });
    }
    
    // Set Email Parameters for Brevo API
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 

    // 1. SENDER: Must be a verified sender in your Brevo account.
    // Recommended to use BREVO_VERIFIED_SENDER_EMAIL for clarity.
    sendSmtpEmail.sender = {
        // Use a verified email as the address
        email: process.env.BREVO_VERIFIED_SENDER_EMAIL, 
        // Use the user's name in the 'from' name for better context
        name: `${name} (via Contact Form)`, 
    };
    
    // 2. TO: Your receiving address (the email you want the contact message to go to).
    sendSmtpEmail.to = [{ email: process.env.EMAIL_RECEIVER_ADDRESS }];
    
    // 3. REPLY-TO: The user's email, so you can reply directly from your inbox.
    sendSmtpEmail.replyTo = { email: email, name: name };
    
    sendSmtpEmail.subject = `New PeerNotez Contact Message from ${name}`;
    
    // 4. HTML Content
    sendSmtpEmail.htmlContent = `
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h3 style="color: #333;">You've received a new message from ${name}:</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Message:</strong></p>
                <div style="border-left: 3px solid #007bff; padding-left: 15px; margin: 15px 0; background-color: #f8f9fa;">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                </div>
            </body>
        </html>
    `;

    // Send the Email via API Call (HTTPS/Port 443)
    try {
        const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
        // The response contains the messageId from Brevo
        res.status(200).json({ success: true, message: 'Message sent successfully!', messageId: response.messageId });
    } catch (error) {
        console.error('Brevo API Error:', error.response ? error.response.text : error.message);
        
        // Return a generic 500 error to the client for security
        res.status(500).json({ 
            success: false, 
            error: `Failed to send message. Please check server logs.` 
        });
    }
});

module.exports = router;

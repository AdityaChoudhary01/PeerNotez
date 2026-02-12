const express = require('express');
const router = express.Router();
const SibApiV3Sdk = require('sib-api-v3-sdk'); 

// --- Brevo API Configuration ---
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// --- API Route handles both Contact Form & Newsletter ---
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Validation
    if (!email || !message) {
        return res.status(400).json({ success: false, error: 'Email and message are required.' });
    }

    const isNewsletter = name === "Newsletter Subscriber";
    const primaryColor = isNewsletter ? '#00f2fe' : '#ff0080'; // Neon Blue vs Neon Pink
    const accentColor = isNewsletter ? '#b388ff' : '#4facfe'; 
    
    // Simple, clear subjects
    const uniqueId = Date.now().toString().slice(-4);
    const subject = isNewsletter 
        ? `🚀 New Subscriber: ${email}` 
        : `📩 New Message from ${name} [ID-${uniqueId}]`;

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); 

    // 1. SENDER
    sendSmtpEmail.sender = {
        email: process.env.BREVO_VERIFIED_SENDER_EMAIL, 
        name: "PeerNotez System"
    };
    
    // 2. TO: Your address
    sendSmtpEmail.to = [{ email: process.env.EMAIL_RECEIVER_ADDRESS }];
    
    // 3. REPLY-TO
    sendSmtpEmail.replyTo = { email: email, name: name };
    
    sendSmtpEmail.subject = subject;
    
    // 4. CLEAN MODERN HTML TEMPLATE
    sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            </style>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0a0118; font-family: 'Inter', Arial, sans-serif; color: #ffffff;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0a0118; padding: 40px 10px;">
                <tr>
                    <td align="center">
                        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #120828; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.6);">
                            
                            <tr>
                                <td height="4" style="background: linear-gradient(90deg, ${primaryColor}, ${accentColor});"></td>
                            </tr>

                            <tr>
                                <td style="padding: 40px;">
                                    <div style="font-size: 20px; font-weight: 800; color: ${primaryColor}; margin-bottom: 30px; letter-spacing: -0.5px;">
                                        PeerNotez <span style="font-size: 11px; font-weight: 400; color: rgba(255,255,255,0.4); margin-left: 10px; border-left: 1px solid rgba(255,255,255,0.2); padding-left: 10px;">Notification</span>
                                    </div>

                                    <h1 style="font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 15px 0;">
                                        ${isNewsletter ? 'New Newsletter Sign-up' : 'New Contact Request'}
                                    </h1>
                                    <p style="font-size: 15px; color: rgba(255,255,255,0.5); margin: 0 0 30px 0; line-height: 1.6;">
                                        You have received a new update from the PeerNotez platform. Details are listed below:
                                    </p>

                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: rgba(255, 255, 255, 0.03); border-radius: 16px; margin-bottom: 30px;">
                                        <tr>
                                            <td style="padding: 20px;">
                                                <div style="font-size: 11px; color: ${primaryColor}; font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">Name</div>
                                                <div style="font-size: 17px; color: #ffffff; font-weight: 600;">${name}</div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 0 20px 20px 20px;">
                                                <div style="font-size: 11px; color: ${primaryColor}; font-weight: 700; text-transform: uppercase; margin-bottom: 5px;">Email</div>
                                                <div style="font-size: 16px; color: #ffffff;">
                                                    <a href="mailto:${email}" style="color: #ffffff; text-decoration: none; border-bottom: 1px solid ${primaryColor};">${email}</a>
                                                </div>
                                            </td>
                                        </tr>
                                    </table>

                                    <div style="font-size: 11px; color: ${primaryColor}; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">Message Content</div>
                                    <div style="background-color: rgba(0,0,0,0.2); padding: 25px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.85); line-height: 1.8; font-size: 15px;">
                                        ${message.replace(/\n/g, '<br>')}
                                    </div>

                                    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px;">
                                        <tr>
                                            <td style="font-size: 11px; color: rgba(255,255,255,0.3); text-align: center; letter-spacing: 0.5px;">
                                                Sent on ${new Date().toLocaleString()} | ID: ${uniqueId}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        res.status(200).json({ success: true, message: 'Sent successfully!' });
    } catch (error) {
        console.error('Brevo SDK Error:', error.response ? error.response.body : error.message);
        res.status(500).json({ success: false, error: 'Email service error.' });
    }
});

module.exports = router;

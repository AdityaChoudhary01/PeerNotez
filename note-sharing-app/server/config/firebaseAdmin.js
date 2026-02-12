// src/config/firebaseAdmin.js (or wherever you keep this file)
const admin = require('firebase-admin');
require('dotenv').config(); 

// 1. Validation: Ensure variables exist to prevent confusing errors
if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.error("❌ Firebase Error: Missing .env variables.");
  // We don't throw an error here so the rest of your app (MongoDB) can still start
} else {

  // 2. Construct the credentials object
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // CRITICAL: Replace the literal characters "\n" with actual newlines
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };

  // 3. Initialize Firebase Admin (Singleton pattern)
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      console.log("🔥 Firebase Admin Initialized Successfully");
    } catch (error) {
      console.error("❌ Firebase Admin Initialization Failed:", error.message);
    }
  }
}

module.exports = admin;

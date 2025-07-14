const cloudinary = require('cloudinary').v2;

// --- IMPORTANT: PASTE YOUR CREDENTIALS DIRECTLY HERE FOR THE TEST ---
cloudinary.config({
  cloud_name: 'dmtnonxtt',
  api_key: '362855654176169',
  api_secret: '7eJoZFAUUhXTfUB_SG_4gGFFh8o'
});

console.log('Attempting to upload a test image to Cloudinary...');

// We will upload a public test image to remove any local file issues.
cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg", {
  public_id: "olympic_flag"
})
.then(result => {
  console.log("✅ SUCCESS: File Uploaded!");
  console.log("URL:", result.secure_url);
})
.catch(error => {
  console.error("❌ FAILED: The upload failed. Here is the exact error:");
  console.error(error);
});
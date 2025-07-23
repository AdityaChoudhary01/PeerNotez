const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => { // Make params an async function to inspect the file
    let resourceType = 'image'; // Default to image

    // Determine resource_type based on file mimetype
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else {
      // For anything else (documents, text, etc.), treat as raw
      resourceType = 'raw';
    }

    return {
      folder: 'notes_uploads',
      allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'ppt', 'pptx'], // Keep your desired formats
      resource_type: resourceType, // Set the determined resource type
      // public_id: `your_custom_public_id_logic_here`, // Optional: if you want custom public IDs
    };
  },
});

module.exports = { storage };

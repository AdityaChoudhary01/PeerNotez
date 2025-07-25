// cloudinaryConfig.js

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // --- ADDED LOGGING START ---
    console.log('--- FILE DETAILS FROM CLOUDINARY STORAGE ---');
    console.log('Original filename:', file.originalname);
    console.log('Detected mimetype by Multer:', file.mimetype);
    console.log('File extension (lowercase):', path.extname(file.originalname).toLowerCase());
    console.log('--- FILE DETAILS END ---');
    // --- ADDED LOGGING END ---

    let resourceType;
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
    } else {
      resourceType = 'raw';
    }
    let customPublicId = path.parse(file.originalname).name + '-' + Date.now();
    if (resourceType === 'raw') {
        customPublicId += path.extname(file.originalname);
    }

    return {
      folder: 'notes_uploads',
      resource_type: resourceType,
      allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'ppt', 'pptx'],
      public_id: customPublicId,
    };
  },
});


module.exports = { cloudinary, storage };

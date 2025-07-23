const path = require('path');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: get file extension safely
function getFileExtension(filename) {
  return path.extname(filename).replace('.', '').toLowerCase();
}

// Allowed formats per resource_type
const ALLOWED = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  video: ['mp4', 'mov', 'webm'],
  raw: ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx']
};

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType, allowedFormats;

    const ext = getFileExtension(file.originalname);
    const mimetype = file.mimetype;

    // Select resource_type and allowed formats
    if (mimetype.startsWith('image/')) {
      resourceType = 'image';
      allowedFormats = ALLOWED.image;
    } else if (mimetype.startsWith('video/')) {
      resourceType = 'video';
      allowedFormats = ALLOWED.video;
    } else {
      resourceType = 'raw';
      allowedFormats = ALLOWED.raw;
    }

    // Check extension
    if (!allowedFormats.includes(ext)) {
      throw new Error(
        `File type .${ext} is not allowed for ${resourceType} upload.`
      );
    }

    console.log(
      `File: ${file.originalname}, Mimetype: ${mimetype}, Determined resource_type: ${resourceType}, Allowed formats: ${allowedFormats}`
    );

    return {
      folder: 'notes_uploads',
      allowed_formats: allowedFormats,
      resource_type: resourceType,
    };
  }
});

module.exports = { storage };

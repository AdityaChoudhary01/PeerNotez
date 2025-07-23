const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType;
    let allowedFormatsForType;

    // Determine resource_type based on file mimetype
    if (file.mimetype.startsWith('image/')) {
      resourceType = 'image';
      allowedFormatsForType = ['jpg', 'jpeg', 'png', 'gif', 'webp']; // Common image formats
    } else if (file.mimetype.startsWith('video/')) {
      resourceType = 'video';
      allowedFormatsForType = ['mp4', 'mov', 'webm']; // Common video formats
    } else {
      // For documents and other non-media files, treat as raw
      resourceType = 'raw';
      allowedFormatsForType = ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx']; // Common document formats
    }

    // You can add a check here if the file format is not in the allowed list for its type
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    if (!allowedFormatsForType.includes(fileExtension)) {
        // This won't stop the upload by Multer, but good for logging/debugging
        console.warn(`Attempting to upload a file (${file.originalname}) with extension ${fileExtension} not explicitly listed in allowed formats for resource_type: ${resourceType}`);
        // Optionally, you could throw an error here to stop the upload earlier
        // throw new Error(`File type ${fileExtension} not supported for ${resourceType} uploads.`);
    }

    console.log(`File: ${file.originalname}, Mimetype: ${file.mimetype}, Determined resource_type: ${resourceType}, Allowed formats for this type: ${allowedFormatsForType.join(', ')}`);

    return {
      folder: 'notes_uploads',
      allowed_formats: allowedFormatsForType, // Crucially, use the specific list
      resource_type: resourceType,
    };
  },
});

module.exports = { storage };

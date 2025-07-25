// config/s3Config.js
const AWS = require('aws-sdk');
require('dotenv').config(); // Load environment variables from .env file

// Configure AWS SDK with your credentials and region
AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION // e.g., 'us-east-1' or 'ap-south-1'
});

// Create an S3 instance. This is what you will use to call S3 methods like .upload(), .deleteObject()
const s3 = new AWS.S3();

module.exports = s3; // Export the configured S3 instance

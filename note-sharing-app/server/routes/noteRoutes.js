const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const Note = require('../models/Note');
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');
const path = require('path');
const { Readable } = require('stream');

// -------------------------------------------------------------------------
// Multer setup to store files in memory temporarily
// -------------------------------------------------------------------------
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// =========================================================================
// Existing GET Routes
// =========================================================================

// @route   GET /api/notes
// @desc    Get all notes with search and filters
router.get('/', async (req, res) => {
  try {
    const limit = 12;
    const page = Number(req.query.page) || 1;
    const { search, title, university, course, subject, year, sort } = req.query;

    const andConditions = [];

    if (search && search.trim() !== '' && search.trim() !== '0') {
      const s = search.trim();
      andConditions.push({
        $or: [
          { title: { $regex: s, $options: 'i' } },
          { university: { $regex: s, $options: 'i' } },
          { course: { $regex: s, $options: 'i' } },
          { subject: { $regex: s, $options: 'i' } },
        ],
      });
    }

    if (title && title.trim() !== '' && title.trim() !== '0') {
      andConditions.push({ title: { $regex: title.trim(), $options: 'i' } });
    }
    if (university && university.trim() !== '' && university.trim() !== '0') {
      andConditions.push({ university: { $regex: university.trim(), 'options': 'i' } });
    }
    if (course && course.trim() !== '' && course.trim() !== '0') {
      andConditions.push({ course: { $regex: course.trim(), $options: 'i' } });
    }
    if (subject && subject.trim() !== '' && subject.trim() !== '0') {
      andConditions.push({ subject: { $regex: subject.trim(), $options: 'i' } });
    }
    if (year && year.trim() !== '' && year.trim() !== '0') {
      const y = Number(year);
      if (!isNaN(y)) {
        andConditions.push({ year: y });
      }
    }

    let query = {};
    if (andConditions.length === 1) {
      query = andConditions[0];
    } else if (andConditions.length > 1) {
      query = { $and: andConditions };
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    let sortOptions = { uploadDate: -1 };
    if (sort === 'highestRated') sortOptions = { rating: -1 };
    if (sort === 'mostDownloaded') sortOptions = { downloadCount: -1 };

    const count = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .populate('user', 'name avatar')
      .sort(sortOptions)
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({ notes, page, totalPages: Math.ceil(count / limit) });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error occurred while fetching notes.' });
  }
});


// @route   GET /api/notes/mynotes
// @desc    Get notes for the logged-in user with pagination
router.get('/mynotes', protect, async (req, res) => {
  try {
    const limit = 8;
    const page = Number(req.query.page) || 1;

    const query = { user: req.user.id };

    const totalNotes = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .sort({ uploadDate: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      notes,
      page,
      totalPages: Math.ceil(totalNotes / limit),
      totalNotes,
    });

  } catch (error) {
    console.error('Error fetching my notes (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while fetching your notes.' });
  }
});

// @route   GET /api/notes/:id
// @desc    Get a single note by ID
router.get('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate({
        path: 'reviews.user',
        select: 'name avatar'
      });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    console.error('Error fetching single note (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while fetching the note.' });
  }
});

// =========================================================================
// UPDATED POST/PUT/DELETE Routes
// =========================================================================

// @route   POST /api/notes/upload
// @desc    Upload a new note (All files uploaded to Cloudinary)
router.post('/upload', protect, uploadToMemory.single('file'), async (req, res) => {
  let uploadResult;
  let finalFilePath;
  let finalCloudinaryId = null;
  const file = req.file;

  try {
    if (!file) {
      console.log('Error: No file received from multer middleware (req.file is null/undefined).');
      return res.status(400).json({
        message: 'No file uploaded or file type not supported.'
      });
    }

    const { title, university, course, subject, year } = req.body;

    const officeMimeTypes = [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    const isOfficeDoc = officeMimeTypes.includes(file.mimetype);
    const isPDF = file.mimetype === 'application/pdf';
    const isImage = file.mimetype.startsWith('image/');
    
    // --- ALL FILES WILL NOW BE UPLOADED TO CLOUDINARY ---
    let resourceType;
    if (isImage || isPDF) {
      // Images and PDFs are uploaded as 'image' for transformation capabilities
      resourceType = 'image';
    } else if (isOfficeDoc) {
      // Office documents are uploaded as 'raw' as they are not transformable on the free tier
      resourceType = 'raw';
    } else {
        return res.status(400).json({ message: 'Unsupported file type. Please upload a PDF, image, or office document.' });
    }

    console.log(`Attempting to upload file to Cloudinary as resource type: ${resourceType}...`);
    
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'notes_uploads',
            resource_type: resourceType,
            // Only include extension in public_id for 'raw' files (office docs)
            public_id: path.parse(file.originalname).name + '-' + Date.now() + (resourceType === 'raw' ? path.extname(file.originalname) : ''),
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary Stream Upload Error:', error);
              return reject(error);
            }
            resolve(result);
          }
        );
        const stream = Readable.from(file.buffer);
        stream.pipe(uploadStream);
      });
    };

    uploadResult = await uploadToCloudinary();
    finalFilePath = uploadResult.secure_url;
    // For 'raw' files, the public_id includes the extension, so we store the full value.
    finalCloudinaryId = uploadResult.public_id;
    console.log('Cloudinary Upload Result (Secure URL):', uploadResult.secure_url);
    console.log('Cloudinary Public ID:', uploadResult.public_id);


    if (!title || !university || !course || !subject || !year) {
      console.log('Error: Missing required text fields for note after file upload.');
      // Clean up orphaned Cloudinary asset
      if (finalCloudinaryId) {
        await cloudinary.uploader.destroy(finalCloudinaryId, { resource_type: resourceType });
        console.warn(`Cleaned up orphaned Cloudinary asset: ${finalCloudinaryId} due to missing note details.`);
      }
      return res.status(400).json({ message: 'Please provide all required fields: title, university, course, subject, and year.' });
    }

    const newNote = new Note({
      title,
      university,
      course,
      subject,
      year,
      fileName: file.originalname,
      filePath: finalFilePath,
      fileType: file.mimetype,
      fileSize: file.size,
      cloudinaryId: finalCloudinaryId,
      user: req.user._id,
    });

    const savedNote = await newNote.save();
    console.log('Note saved to DB successfully!');
    res.status(201).json(savedNote);

  } catch (error) {
    console.error('--- START SERVER-SIDE ERROR LOG (Conditional Upload) ---');
    console.error('Note upload failed:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    if (error.response && error.response.data) {
      console.error('Error response data (if applicable):', error.response.data);
    }
    console.error('--- END SERVER-SIDE ERROR LOG (Conditional Upload) ---');

    if (file && finalCloudinaryId) {
        try {
            const isOfficeDoc = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.mimetype);
            const resourceTypeForDeletion = (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') ? 'image' : 'raw';
            await cloudinary.uploader.destroy(finalCloudinaryId, { resource_type: resourceTypeForDeletion });
            console.warn(`Cleaned up Cloudinary asset: ${finalCloudinaryId} after failed DB save.`);
        } catch (cleanupError) {
            console.error('Failed to clean up Cloudinary asset after upload error:', cleanupError);
        }
    }
    res.status(500).json({ message: 'Upload failed. Please check the file and form data and try again.' });
  }
});


// @route   POST /api/notes/:id/reviews
// @desc    Create a new review for a note
router.post('/:id/reviews', protect, async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      const alreadyReviewed = note.reviews.find(r => r.user.toString() === req.user.id.toString());
      if (alreadyReviewed) {
        return res.status(400).json({ message: 'You have already reviewed this note' });
      }

      const review = { user: req.user.id, rating: Number(rating), comment };
      note.reviews.push(review);

      note.numReviews = note.reviews.length;
      note.rating = note.reviews.reduce((acc, item) => item.rating + acc, 0) / note.reviews.length;

      await note.save();
      res.status(201).json({ message: 'Review added successfully!', review });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    console.error('Error adding review (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while adding review.' });
  }
});

// @route   PUT /api/notes/:id/download
// @desc    Increment the download count for a note
router.put('/:id/download', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (note) {
      await Note.findByIdAndUpdate(req.params.id, { $inc: { downloadCount: 1 } });
      res.json({ message: 'Download count updated' });
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    console.error('Error updating download count (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while updating download count.' });
  }
});

// @route   PUT /api/notes/:id
// @desc    Update a note (only by owner)
router.put('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this note' });
    }

    const { title, university, course, subject, year } = req.body;
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (university !== undefined) updateFields.university = university;
    if (course !== undefined) updateFields.course = course;
    if (subject !== undefined) updateFields.subject = subject;
    if (year !== undefined) updateFields.year = year;

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while updating the note.' });
  }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note (only by owner or Admin), and clean up from saved lists
// @access  Private (Owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Authorization check
    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this note' });
    }

    // --- CRITICAL ADDITION: Remove this note's ID from all users' savedNotes arrays ---
    await User.updateMany( // Use User model here
      { savedNotes: note._id }, // Find users who have this note saved
      { $pull: { savedNotes: note._id } } // Pull (remove) this ID from their savedNotes array
    );
    console.log(`Cleaned up note ID ${note._id} from all users' savedNotes lists.`);


    // Conditional deletion based on where the file was stored (using cloudinaryId as indicator)
    if (note.cloudinaryId) { // If a cloudinaryId exists, it's on Cloudinary
      let resourceTypeForDeletion = note.fileType && note.fileType.startsWith('image/') ? 'image' : 'raw';
      if (note.fileType === 'application/pdf') { // PDFs are treated as 'image' for preview generation in Cloudinary
        resourceTypeForDeletion = 'image';
      }
      await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: resourceTypeForDeletion });
      console.log(`Deleted Cloudinary asset: ${note.cloudinaryId}`);
    } else if (note.filePath && note.filePath.includes(process.env.AWS_S3_BUCKET_NAME)) { // If filePath contains S3 bucket name
        const s3Bucket = process.env.AWS_S3_BUCKET_NAME;
        const s3KeyMatch = note.filePath.match(new RegExp(`/${s3Bucket}/(.*)`));
        const s3Key = s3KeyMatch ? s3KeyMatch[1] : null;

        if (s3Key) {
            await s3.deleteObject({ Bucket: s3Bucket, Key: s3Key }).promise();
            console.log(`Deleted S3 asset: ${s3Key}`);
        } else {
            console.warn(`Could not determine S3 key for deletion from filePath: ${note.filePath}. Manual cleanup may be required.`);
        }
    } else {
        console.warn(`File deletion failed: Could not determine storage service for note ID ${note._id}. FilePath: ${note.filePath}`);
    }

    // Finally, delete the note document from MongoDB
    await note.deleteOne();
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    console.error('Error deleting note (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while deleting the note.' });
  }
});

// =========================================================================
// Global Error Handling Middleware (for Multer and other uncaught errors)
// =========================================================================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('--- START MULTER ERROR ---');
    console.error('MulterError caught:', err.code, err.message);
    console.error('Multer Stack:', err.stack);
    console.error('--- END MULTER ERROR ---');
    return res.status(400).json({ message: `File upload error: ${err.message}` });
  } else if (err) {
    console.error('--- START GENERAL UPLOAD ERROR ---');
    console.error('General upload error caught:', err);
    console.error('General Error Stack:', err.stack);
    console.error('--- END GENERAL UPLOAD ERROR ---');
    return res.status(500).json({ message: 'An unexpected file upload error occurred.' });
  }
  next();
});

module.exports = router;

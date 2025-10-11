const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const Note = require('../models/Note');
const User = require('../models/User'); 
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
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
// NEW ORDERED ROUTES
// Place more specific routes at the top to avoid conflicts with :id
// =========================================================================

// @route GET /api/notes/stats
// @desc Get key statistics for the homepage
router.get('/stats', async (req, res) => {
    try {
        const totalNotes = await Note.countDocuments();
        const totalUsers = await User.countDocuments();
        
        const totalDownloadsResult = await Note.aggregate([
            { $group: { _id: null, total: { $sum: "$downloadCount" } } }
        ]);
        
        const totalDownloads = totalDownloadsResult.length > 0 ? totalDownloadsResult[0].total : 0;

        res.json({
            totalNotes,
            totalUsers,
            downloadsThisMonth: totalDownloads,
        });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ message: 'Failed to fetch statistics.' });
    }
});

// @route GET /api/notes/users/top-contributors
// @desc Get top contributors for the homepage (based on note count)
router.get('/users/top-contributors', async (req, res) => {
    try {
        const topContributors = await User.aggregate([
            {
                $lookup: {
                    from: 'peernotez_notes',
                    localField: '_id',
                    foreignField: 'user',
                    as: 'notes'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    avatar: 1,
                    noteCount: { $size: '$notes' }
                }
            },
            { $sort: { noteCount: -1 } },
            { $limit: 4 }
        ]);

        res.json({ users: topContributors });
    } catch (error) {
        console.error('Error fetching top contributors:', error);
        res.status(500).json({ message: 'Failed to fetch top contributors.' });
    }
});

// @route GET /api/notes/blog-posts
// @desc Get mock blog posts for the homepage
router.get('/blog-posts', (req, res) => {
    const mockPosts = [
        { id: 1, title: "The Best Note-Taking Strategies for University", summary: "Learn how to optimize your study habits with these proven note-taking techniques.", slug: "best-note-taking-strategies" },
        { id: 2, title: "How PeerNotez Can Boost Your Grades", summary: "Discover how our collaborative platform gives you an edge in your academic career.", slug: "how-peernotez-boosts-grades" },
        { id: 3, title: "Top 10 Courses to Study in 2025", summary: "A look at the most popular and in-demand courses for students planning their future.", slug: "top-10-courses" },
    ];
    res.json({ posts: mockPosts });
});

// @route   GET /api/notes
// @desc    Get all notes with search and filters
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    const { search, title, university, course, subject, year, sort, isFeatured } = req.query;

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
      // CORRECTED: using $options
      andConditions.push({ title: { $regex: title.trim(), $options: 'i' } });
    }
    if (university && university.trim() !== '' && university.trim() !== '0') {
      // CORRECTED: using $options
      andConditions.push({ university: { $regex: university.trim(), $options: 'i' } });
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
    
    if (isFeatured) {
        andConditions.push({ isFeatured: true });
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
    
    if (isFeatured) {
        sortOptions = { uploadDate: -1 };
    }

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
    
    let resourceType;
    if (isImage || isPDF) {
      resourceType = 'image';
    } else if (isOfficeDoc) {
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
    finalCloudinaryId = uploadResult.public_id;
    console.log('Cloudinary Upload Result (Secure URL):', uploadResult.secure_url);
    console.log('Cloudinary Public ID:', uploadResult.public_id);


    if (!title || !university || !course || !subject || !year) {
      console.log('Error: Missing required text fields for note after file upload.');
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
     await indexingService.urlUpdated(savedNote._id.toString(), 'note');
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

// In noteRoutes.js:

// @route PUT /api/notes/:id/download
// @desc Increment the download count for a note and RETURN THE UPDATED NOTE
router.put('/:id/download', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id, 
      { $inc: { downloadCount: 1 } },
      { new: true } // <-- CRITICAL: Tells Mongoose to return the new document
    );

    if (updatedNote) {
      // Return the entire updated note object
      res.json(updatedNote); 
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
    await indexingService.urlUpdated(updatedNote._id.toString(), 'note');
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note (noteRoutes):', error);
    res.status(500).json({ message: 'Server Error occurred while updating the note.' });
  }
});

// @route   PUT /api/notes/:id/toggle-featured
// @desc    Toggle a note's featured status (Admin only)
// @access  Private/Admin
router.put('/:id/toggle-featured', protect, admin, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found.' });
    }

    note.isFeatured = !note.isFeatured;

    const updatedNote = await note.save();
    res.json({
      message: `Note's featured status updated to ${updatedNote.isFeatured}.`,
      isFeatured: updatedNote.isFeatured
    });

  } catch (error) {
    console.error('Error toggling featured status:', error);
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

    if (note.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this note' });
    }

    await User.updateMany(
      { savedNotes: note._id },
      { $pull: { savedNotes: note._id } }
    );
    console.log(`Cleaned up note ID ${note._id} from all users' savedNotes lists.`);

    if (note.cloudinaryId) {
      const resourceTypeForDeletion = (note.fileType && (note.fileType.startsWith('image/') || note.fileType === 'application/pdf')) ? 'image' : 'raw';

      await cloudinary.uploader.destroy(note.cloudinaryId, { resource_type: resourceTypeForDeletion });
      console.log(`Deleted Cloudinary asset: ${note.cloudinaryId}`);
    } else {
      console.warn(`File deletion failed: Could not determine storage service for note ID ${note._id}. FilePath: ${note.filePath}`);
    }
await indexingService.urlDeleted(note._id.toString(), 'note');
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

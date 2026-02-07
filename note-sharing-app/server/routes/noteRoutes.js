const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const Note = require('../models/Note');
const User = require('../models/User'); 
const Collection = require('../models/Collection'); // NEW: Import Collection model
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const path = require('path');
const { Readable } = require('stream');
const indexingService = require('../utils/indexingService'); // For SEO/Indexing

// -------------------------------------------------------------------------
// Multer setup to store files in memory temporarily
// -------------------------------------------------------------------------
const memoryStorage = multer.memoryStorage();
const uploadToMemory = multer({
  storage: memoryStorage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Utility function for updating review stats (Only considers top-level, rated comments)
const updateNoteReviewStats = (note) => {
    // Filter to only include top-level reviews that provided a rating (> 0)
    const ratedReviews = note.reviews.filter(r => !r.parentReviewId && r.rating > 0);
    
    note.numReviews = ratedReviews.length;
    
    // Calculate new average rating
    note.rating = ratedReviews.length > 0
        ? ratedReviews.reduce((acc, item) => item.rating + acc, 0) / ratedReviews.length
        : 0;
};

// Helper function to create an $in or $regex query from a CSV string
const createInQuery = (param) => {
    if (!param || param.trim() === '' || param.trim() === '0') return null;
    
    // Function to safely escape regex special characters in each search term
    const escapeRegex = (string) => {
        // Escape characters like . * + ? ^ $ { } ( ) | [ ] \
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };

    // 1. Split, trim, and filter values
    const values = param.split(',')
        .map(v => v.trim())
        .filter(v => v); 
    
    if (values.length === 0) {
        return null;
    }
    
    // 2. Handle Multi-Value Search (The most likely fix)
    if (values.length > 1) {
        // Escape each term, then join them with the OR operator (|)
        // E.g., ['Web development', 'aws'] -> 'Web development|aws'
        const safeValues = values.map(escapeRegex);
        const regexPattern = safeValues.join('|');
        
        // Use $regex for a case-insensitive OR substring match
        return { $regex: regexPattern, $options: 'i' };

    } else {
        // 3. Handle Single-Value Search
        const safeValue = escapeRegex(values[0]);
        return { $regex: safeValue, $options: 'i' };
    }
};

// =========================================================================
// PUBLIC & LISTING ROUTES
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
                    from: 'notes', 
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

// @route GET /api/notes/blog-posts (Mock data, should be removed)
router.get('/blog-posts', (req, res) => {
    const mockPosts = [
        { id: 1, title: "The Best Note-Taking Strategies for University", summary: "Learn how to optimize your study habits with these proven note-taking techniques.", slug: "best-note-taking-strategies" },
        { id: 2, title: "How PeerNotez Can Boost Your Grades", summary: "Discover how our collaborative platform gives you an edge in your academic career.", slug: "how-peernotez-boosts-grades" },
        { id: 3, title: "Top 10 Courses to Study in 2025", summary: "A look at the most popular and in-demand courses for students planning their future.", slug: "top-10-courses" },
    ];
    res.json({ posts: mockPosts });
});


// ✅ FIX 4: NEW RELATED NOTES ROUTE (Must be before /:id)
// =========================================================================
// @route   GET /api/notes/related/:id
router.get('/related/:id', async (req, res) => {
    try {
        const currentNote = await Note.findById(req.params.id);
        if (!currentNote) return res.status(404).json({ message: 'Note not found' });

        // Find notes with same subject OR course, excluding current one
        const relatedNotes = await Note.find({
            _id: { $ne: currentNote._id }, // Exclude current note
            $or: [
                { subject: currentNote.subject },
                { course: currentNote.course }
            ]
        })
        .select('title description university course subject year rating numReviews downloadCount uploadDate fileType fileName cloudinaryId filePath isFeatured') 
        .populate('user', 'name avatar')
        .limit(4) // Show 4 related notes
        .sort({ rating: -1, downloadCount: -1 }); // Show best/most popular first

        res.json(relatedNotes);
    } catch (error) {
        console.error('Error fetching related notes:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});



// @route   GET /api/notes
// @desc    Get all notes with search and advanced filters
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = Number(req.query.page) || 1;
    let { search, title, university, course, subject, year, sort, isFeatured } = req.query; // Use 'let' for modification

    // CRITICAL FIX 1: Decode the parameter if it looks like it was encoded
    if (subject && subject.includes('%2C')) {
        subject = decodeURIComponent(subject);
    }
    // Optional: Decode others in case of spaces, though the comma is the main issue
    if (university && university.includes('%2C')) {
        university = decodeURIComponent(university);
    }
    if (course && course.includes('%2C')) {
        course = decodeURIComponent(course);
    }


    const andConditions = [];
    
    // --- ADVANCED FILTER SETUP ---
    // Now pass the decoded 'subject' string to createInQuery
    const universityQuery = createInQuery(university);
    const courseQuery = createInQuery(course);
    const subjectQuery = createInQuery(subject); 
    
    const isSubjectFilterActive = !!subjectQuery;

    // Global Search (Standard $or search)
    if (search && search.trim() !== '' && search.trim() !== '0') {
      const s = search.trim();
        
        // Fields for Global Search
        const globalSearchFields = [
            { title: { $regex: s, $options: 'i' } },
            { university: { $regex: s, $options: 'i' } },
            { course: { $regex: s, $options: 'i' } },
        ];
        
        // CRITICAL FIX: Conditional Subject Search (prevents conflict)
        if (!isSubjectFilterActive) {
            globalSearchFields.push({ subject: { $regex: s, $options: 'i' } });
        }

      andConditions.push({ $or: globalSearchFields });
    }
    
    // --------------------------------------------
    // --- ADVANCED FILTERING LOGIC ---
    // --------------------------------------------
    
    // University
    if (universityQuery) {
        andConditions.push({ university: universityQuery });
    }

    // Course
    if (courseQuery) {
        andConditions.push({ course: courseQuery });
    }

    // Subject (Uses the subjectQuery built from the decoded string)
    if (subjectQuery) {
        andConditions.push({ subject: subjectQuery });
    }
    
    if (title && title.trim() !== '' && title.trim() !== '0') {
        andConditions.push({ title: { $regex: title.trim(), $options: 'i' } });
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
    // --- END ADVANCED FILTERING LOGIC ---


    let query = {};
    if (andConditions.length === 1) {
      query = andConditions[0];
    } else if (andConditions.length > 1) {
      query = { $and: andConditions };
    }

    console.log('MongoDB query:', JSON.stringify(query, null, 2));

    let sortOptions = { uploadDate: -1 };
    // ... existing sort logic ...
    if (sort === 'highestRated') sortOptions = { rating: -1 };
    if (sort === 'mostDownloaded') sortOptions = { downloadCount: -1 };
    if (isFeatured) {
        sortOptions = { uploadDate: -1 };
    }
    
    // 🛑 FIX APPLIED HERE: Added 'isFeatured' to the selected fields.
    const selectFields = 'title university course subject year rating numReviews downloadCount uploadDate fileType fileName cloudinaryId filePath isFeatured'; 
    
    const count = await Note.countDocuments(query);
    const notes = await Note.find(query)
      .select(selectFields)
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


// 🚀 ADDED ROUTE: GET NOTES BY USER (For Public Profile Page)
// @route   GET /api/notes/user/:userId
// @desc    Get all notes by a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const notes = await Note.find({ user: req.params.userId })
            .select('title university course subject year rating numReviews downloadCount uploadDate fileType fileName cloudinaryId filePath isFeatured')
            .populate('user', 'name avatar')
            .sort({ uploadDate: -1 });
        res.json({ notes });
    } catch (error) {
        console.error('Error fetching user notes:', error);
        res.status(500).json({ message: 'Error fetching user notes' });
    }
});

// @route   GET /api/notes/mynotes
// @desc    Get notes for the logged-in user with pagination
router.get('/mynotes', protect, async (req, res) => {
  try {
    const limit = 8;
    const page = Number(req.query.page) || 1;

    const query = { user: req.user.id };

    // 🛑 FIX APPLIED HERE: Added 'isFeatured' to the selected fields.
    const selectFields = 'title university course subject year rating numReviews downloadCount uploadDate fileType fileName cloudinaryId filePath isFeatured'; // ADDED all file metadata fields

    const totalNotes = await Note.countDocuments(query);

    const notes = await Note.find(query)
      .select(selectFields) // Applied explicit selection
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

// =========================================================================
// UPDATED POST/PUT/DELETE Routes
// =========================================================================

// @route   POST /api/notes/upload
// @desc    Upload a new note
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

    // ✅ SEO UPDATE (Fix 1): Extract 'description' from body
    const { title, description, university, course, subject, year } = req.body;

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

    // ✅ SEO UPDATE (Fix 1): Check for description existence
    if (!title || !university || !course || !subject || !year || !description) {
      console.log('Error: Missing required text fields for note after file upload.');
      if (finalCloudinaryId) {
        await cloudinary.uploader.destroy(finalCloudinaryId, { resource_type: resourceType });
        console.warn(`Cleaned up orphaned Cloudinary asset: ${finalCloudinaryId} due to missing note details.`);
      }
      return res.status(400).json({ message: 'Please provide all required fields: title, description, university, course, subject, and year.' });
    }

    const newNote = new Note({
      title,
      description, // ✅ Saved
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
    
    // Increment user's noteCount (for Gamification)
    await req.user.updateOne({ $inc: { noteCount: 1 } });
    
    await indexingService.urlUpdated(savedNote._id.toString(), 'note'); // Use ID and type 'note'
    console.log('Note saved to DB successfully!');
    res.status(201).json(savedNote);

  } catch (error) {
    console.error('--- START SERVER-SIDE ERROR LOG (Conditional Upload) ---');
    console.error('Note upload failed:', error);
    
    if (file && finalCloudinaryId) {
        try {
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
// @desc    Create a new review for a note (Supports nested replies)
router.post('/:id/reviews', protect, async (req, res) => {
    const { rating, comment, parentReviewId } = req.body; 

    try {
        const note = await Note.findById(req.params.id);

        if (note) {
            let finalRating;

            if (parentReviewId) {
                // FIX: Set rating to undefined for replies. 
                // This ensures Mongoose skips the 'min: 1' validation.
                finalRating = undefined;
                
            } else {
                // Top-Level Review Logic
                finalRating = Number(rating) || 0;

                // Check for existing top-level review
                const alreadyReviewedTopLevel = note.reviews.some(
                    r => r.user.toString() === req.user.id.toString() && !r.parentReviewId
                );
                if (alreadyReviewedTopLevel) {
                    return res.status(400).json({ message: 'You have already posted a top-level review for this note.' });
                }
            }

            // Create the base review object
            const reviewData = { 
                user: req.user.id, 
                comment,
                parentReviewId: parentReviewId || null // Set parent ID for nested comments
            };
            
            // Only include the rating field if it is not undefined (i.e., only for top-level reviews)
            if (finalRating !== undefined) {
                 reviewData.rating = finalRating;
            }

            note.reviews.push(reviewData);

            // Only update stats if this is a top-level comment with a valid rating (>= 1)
            if (!parentReviewId && finalRating >= 1) {
                updateNoteReviewStats(note); // Use the new function
            }

            await note.save();
            res.status(201).json({ message: 'Comment added successfully!', review: reviewData });
        } else {
            res.status(404).json({ message: 'Note not found' });
        }
    } catch (error) {
        // IMPROVED ERROR HANDLING: Catch Mongoose validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: "Validation Failed: " + error.message, 
                errors: error.errors 
            });
        }
        console.error('Error adding review (noteRoutes):', error);
        res.status(500).json({ message: 'Server Error occurred while adding comment.' });
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

        // NEW: Decrement user's noteCount (for Gamification)
        await req.user.updateOne({ $inc: { noteCount: -1 } });
        
        await User.updateMany(
            { savedNotes: note._id },
            { $pull: { savedNotes: note._id } }
        );
        console.log(`Cleaned up note ID ${note._id} from all users' savedNotes lists.`);

        // NEW: Also clean up from Collections
        await Collection.updateMany(
            { notes: note._id },
            { $pull: { notes: note._id } }
        );
        console.log(`Cleaned up note ID ${note._id} from all collections.`);


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
// NEW: COLLECTION ROUTES
// =========================================================================

// @route   POST /api/notes/collections
// @desc    Create a new note collection (playlist)
router.post('/collections', protect, async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Collection name is required.' });
    }
    try {
        const newCollection = new Collection({
            user: req.user.id,
            name: name,
        });
        const savedCollection = await newCollection.save();
        res.status(201).json(savedCollection);
    } catch (error) {
        console.error('Error creating collection:', error);
        res.status(500).json({ message: 'Failed to create collection.' });
    }
});

// @route   GET /api/notes/collections
// @desc    Get all user collections
router.get('/collections', protect, async (req, res) => {
    try {
        const collections = await Collection.find({ user: req.user.id })
            .select('name notes createdAt')
            .lean(); 
        
        res.json(collections);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch collections.' });
    }
});




// @route   GET /api/notes/collections/:collectionId
// @desc    Get a single user collection with populated notes
router.get('/collections/:collectionId', protect, async (req, res) => {
    try {
        // Find the collection by ID and verify ownership (req.user.id)
        const collection = await Collection.findOne({
            _id: req.params.collectionId,
            user: req.user.id
        })
        .select('name notes createdAt') // Select fields needed for the collection wrapper
        .populate({
            path: 'notes',
            // Select the note fields required for the client-side NoteCard component
            select: 'title university course subject year rating numReviews downloadCount uploadDate fileType fileName filePath cloudinaryId isFeatured'
        })
        .lean(); // Use .lean() to return a plain JS object, preventing 500 errors

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found or access denied.' });
        }
        
        res.json(collection);
    } catch (error) {
        console.error('Error fetching single collection:', error);
        // Handle invalid ID format gracefully
        if (error.kind === 'ObjectId') {
             return res.status(400).json({ message: 'Invalid Collection ID format.' });
        }
        res.status(500).json({ message: 'Failed to fetch collection details.' });
    }
});

// @route   PUT /api/notes/collections/:collectionId/add/:noteId
// @desc    Add a note to a collection
router.put('/collections/:collectionId/add/:noteId', protect, async (req, res) => {
    try {
        const { collectionId, noteId } = req.params;

        // Check if the note exists
        const noteExists = await Note.exists({ _id: noteId });
        if (!noteExists) {
          return res.status(404).json({ message: 'Note not found.' });
        }

        const collection = await Collection.findOneAndUpdate(
            // Match by ID, ensure user owns it, and note is NOT already present ($ne)
            { _id: collectionId, user: req.user.id, notes: { $ne: noteId } },
            { $push: { notes: noteId } },
            { new: true }
        );

        if (!collection) {
            // If not found, it's either: 1. Collection DNE, 2. User DNE, 3. Note already added.
            const checkCollectionOwnership = await Collection.findOne({ _id: collectionId, user: req.user.id });
            if (!checkCollectionOwnership) {
                return res.status(404).json({ message: 'Collection not found or access denied.' });
            } else if (checkCollectionOwnership.notes.includes(noteId)) {
                return res.status(409).json({ message: 'Note already exists in this collection.' });
            }
            return res.status(404).json({ message: 'Collection not found or update failed.' });
        }
        res.json({ message: 'Note added to collection.', collection });
    } catch (error) {
        console.error('Error adding note to collection:', error);
        res.status(500).json({ message: 'Failed to add note to collection.' });
    }
});

// @route   PUT /api/notes/collections/:collectionId/remove/:noteId
// @desc    Remove a note from a collection
router.put('/collections/:collectionId/remove/:noteId', protect, async (req, res) => {
    try {
        const { collectionId, noteId } = req.params;
        const collection = await Collection.findOneAndUpdate(
            { _id: collectionId, user: req.user.id },
            { $pull: { notes: noteId } },
            { new: true }
        );

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found or access denied.' });
        }
        res.json({ message: 'Note removed from collection.', collection });
    } catch (error) {
        console.error('Error removing note from collection:', error);
        res.status(500).json({ message: 'Failed to remove note from collection.' });
    }
});

// @route   PUT /api/notes/collections/:collectionId
// @desc    Update (Rename) a collection
router.put('/collections/:collectionId', protect, async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'New collection name is required.' });
    }

    try {
        // Find the collection by ID and ensure user owns it, then update the name
        const collection = await Collection.findOneAndUpdate(
            { _id: req.params.collectionId, user: req.user.id },
            { name: name.trim() },
            { new: true, runValidators: true } // {new: true} returns the updated document
        );

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found or access denied.' });
        }
        res.json({ message: `Collection renamed to ${collection.name}`, collection });
    } catch (error) {
        console.error('Error renaming collection:', error);
        res.status(500).json({ message: 'Failed to rename collection.' });
    }
});

// @route   DELETE /api/notes/collections/:collectionId
// @desc    Delete a collection
router.delete('/collections/:collectionId', protect, async (req, res) => {
    try {
        const { collectionId } = req.params;
        const collection = await Collection.findOneAndDelete({ 
            _id: collectionId, 
            user: req.user.id 
        });

        if (!collection) {
            return res.status(404).json({ message: 'Collection not found or access denied.' });
        }
        res.json({ message: `Collection '${collection.name}' deleted successfully.` });
    } catch (error) {
        console.error('Error deleting collection:', error);
        res.status(500).json({ message: 'Failed to delete collection.' });
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

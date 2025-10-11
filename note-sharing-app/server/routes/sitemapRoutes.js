const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); 
const Note = require('../models/Note'); 

const BASE_URL = 'https://peernotez.onrender.com'; // IMPORTANT: Use your Render URL here

// Function to safely extract or provide a date string
const getSafeLastMod = (doc) => {
    // Check if updatedAt or createdAt is present and valid
    const date = doc.updatedAt || doc.createdAt;
    
    // If the date is missing, use the current date as a fallback (though models should enforce this)
    if (!date) {
        return new Date().toISOString().split('T')[0];
    }
    
    // Ensure the date is a Date object (if not using .lean() this is often needed)
    // For Mongoose documents, direct access usually works, but this adds safety.
    if (typeof date.toISOString === 'function') {
        return date.toISOString().split('T')[0];
    }
    
    // Fallback if the object is corrupted but exists
    return new Date().toISOString().split('T')[0];
};


router.get('/sitemap-dynamic.xml', async (req, res) => {
    try {
        // Ensure you are selecting the date fields and using .lean() for performance
        const blogs = await Blog.find({}).select('slug createdAt updatedAt').lean();
        const notes = await Note.find({}).select('_id createdAt updatedAt').lean();

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // 1. Add Note URLs
        notes.forEach(note => {
            const url = `${BASE_URL}/view/${note._id.toString()}`;
            // FIX APPLIED HERE: Use the safety function
            const lastMod = getSafeLastMod(note); 
            xml += `
                <url>
                    <loc>${url}</loc>
                    <lastmod>${lastMod}</lastmod>
                    <changefreq>weekly</changefreq>
                    <priority>0.8</priority>
                </url>`;
        });
        
        // 2. Add Blog URLs
        blogs.forEach(blog => {
            const url = `${BASE_URL}/blogs/${blog.slug}`;
            // FIX APPLIED HERE: Use the safety function
            const lastMod = getSafeLastMod(blog);
            xml += `
                <url>
                    <loc>${url}</loc>
                    <lastmod>${lastMod}</lastmod>
                    <changefreq>daily</changefreq>
                    <priority>0.9</priority>
                </url>`;
        });

        xml += '</urlset>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error("Error generating dynamic sitemap:", error);
        // Respond with an error status to prevent the browser from hanging
        res.status(500).send('Error generating sitemap.');
    }
});

module.exports = router;

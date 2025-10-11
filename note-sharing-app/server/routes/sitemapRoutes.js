const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); 
const Note = require('../models/Note'); 

const BASE_URL = 'https://peernotez.netlify.app'; // CRITICAL FIX: Set to your public domain

// Function to safely extract or provide a date string
const getSafeLastMod = (doc) => {
    // 1. Try standard Mongoose updatedAt/createdAt (best for fresh content/updates)
    // 2. Fallback to custom uploadDate (best for old Note documents)
    // 3. Fallback to current date (if all else fails)
    const date = doc.updatedAt || doc.createdAt || doc.uploadDate || new Date();
    
    // Ensure the resulting date is converted to an ISO string and split
    return date.toISOString().split('T')[0];
};


router.get('/sitemap-dynamic.xml', async (req, res) => {
    try {
        // Fetch published blogs
        const blogs = await Blog.find({}).select('slug createdAt updatedAt').lean();
        
        // Fetch published notes, explicitly include the required uploadDate, createdAt, and updatedAt
        const notes = await Note.find({}).select('_id uploadDate createdAt updatedAt').lean(); 

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // 1. Add Note URLs
        notes.forEach(note => {
            const url = `${BASE_URL}/view/${note._id.toString()}`;
            // FIX APPLIED HERE: The safety function handles the field priority
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
            // Blogs only use createdAt/updatedAt
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
        res.status(500).send('Error generating sitemap.');
    }
});

module.exports = router;

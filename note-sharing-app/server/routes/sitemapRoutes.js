const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); 
const Note = require('../models/Note'); 

const BASE_URL = 'https://peernotez.netlify.app'; // Your public frontend URL

// Function to safely extract the best date for SEO
const getSafeLastMod = (doc) => {
    // 1. Priority: updatedAt (Shows recent reviews/edits)
    // 2. Fallback: createdAt (Creation time)
    // 3. Fallback: uploadDate (Legacy note field)
    // 4. Final Fallback: Current Date
    const date = doc.updatedAt || doc.createdAt || doc.uploadDate || new Date();
    
    // Ensure it is a valid Date object
    const dateObj = new Date(date);
    
    // Return formatted YYYY-MM-DD string
    // If date is invalid, fallback to today
    return isNaN(dateObj.getTime()) 
        ? new Date().toISOString().split('T')[0] 
        : dateObj.toISOString().split('T')[0];
};

router.get('/sitemap-dynamic.xml', async (req, res) => {
    try {
        // Fetch published blogs (lightweight query)
        const blogs = await Blog.find({}).select('slug createdAt updatedAt').lean();
        
        // Fetch notes (lightweight query)
        // We explicitly select 'updatedAt' to capture the new Fix 3 logic
        const notes = await Note.find({}).select('_id uploadDate createdAt updatedAt').lean(); 

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // ----------------------------------------
        // 1. Static Routes (Crucial for complete indexing)
        // ----------------------------------------
        const staticRoutes = [
            '',           // Home
            '/about',
            '/contact',
            '/login',
            '/signup',
            '/search',
            '/donate',
            '/dmca',
            '/terms',
            '/privacy'
        ];

        staticRoutes.forEach(path => {
             xml += `
            <url>
                <loc>${BASE_URL}${path}</loc>
                <changefreq>weekly</changefreq>
                <priority>0.8</priority>
            </url>`;
        });

        // ----------------------------------------
        // 2. Dynamic Note Routes
        // ----------------------------------------
        notes.forEach(note => {
            const url = `${BASE_URL}/view/${note._id.toString()}`;
            const lastMod = getSafeLastMod(note); 
            xml += `
            <url>
                <loc>${url}</loc>
                <lastmod>${lastMod}</lastmod>
                <changefreq>weekly</changefreq>
                <priority>0.9</priority>
            </url>`;
        });
        
        // ----------------------------------------
        // 3. Dynamic Blog Routes
        // ----------------------------------------
        blogs.forEach(blog => {
            const url = `${BASE_URL}/blogs/${blog.slug}`;
            const lastMod = getSafeLastMod(blog); 
            xml += `
            <url>
                <loc>${url}</loc>
                <lastmod>${lastMod}</lastmod>
                <changefreq>monthly</changefreq>
                <priority>0.7</priority>
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

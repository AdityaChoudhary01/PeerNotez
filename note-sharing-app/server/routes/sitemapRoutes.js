const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); 
const Note = require('../models/Note'); 

const BASE_URL = 'https://peernotez.netlify.app';

router.get('/sitemap-dynamic.xml', async (req, res) => {
    try {
        // Fetch published blogs
        const blogs = await Blog.find({}).select('slug createdAt updatedAt').lean();
        // Fetch published notes
        const notes = await Note.find({}).select('_id createdAt updatedAt').lean();

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        // 1. Add Note URLs
        notes.forEach(note => {
            const url = `${BASE_URL}/view/${note._id.toString()}`;
            const lastMod = (note.updatedAt || note.createdAt).toISOString().split('T')[0];
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
            const lastMod = (blog.updatedAt || blog.createdAt).toISOString().split('T')[0];
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

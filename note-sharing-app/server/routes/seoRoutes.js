const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog'); 
const Note = require('../models/Note'); 
const User = require('../models/User'); 

const BASE_URL = 'https://peernotez.netlify.app';

router.get('/sitemap.xml', async (req, res) => {
    try {
        const [blogs, notes, users] = await Promise.all([
            Blog.find({}).select('slug updatedAt createdAt').lean(),
            Note.find({}).select('_id updatedAt createdAt').lean(),
            User.find({}).select('_id updatedAt createdAt').lean()
        ]);

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // 1. Static Pages
        const staticPages = ['', '/search', '/blogs', '/upload'];
        staticPages.forEach(path => {
            xml += `  <url><loc>${BASE_URL}${path}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
        });

        // 2. Note Pages
        notes.forEach(n => {
            xml += `  <url><loc>${BASE_URL}/view/${n._id}</loc><lastmod>${(n.updatedAt || n.createdAt).toISOString().split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
        });
        
        // 3. Blog Pages
        blogs.forEach(b => {
            xml += `  <url><loc>${BASE_URL}/blogs/${b.slug}</loc><lastmod>${(b.updatedAt || b.createdAt).toISOString().split('T')[0]}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
        });

        // 4. User Profiles
        users.forEach(u => {
            xml += `  <url><loc>${BASE_URL}/profile/${u._id}</loc><lastmod>${(u.updatedAt || u.createdAt).toISOString().split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>\n`;
        });

        xml += '</urlset>';
        res.header('Content-Type', 'application/xml').send(xml);
    } catch (err) {
        res.status(500).end();
    }
});

module.exports = router;

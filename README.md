# 📚 PeerNotez

**PeerNotez** is a modern, full-stack web application where students can **upload**, **share**, and **discover academic notes** — including PDFs, DOCX, PPTX, and images. Designed for seamless collaboration and easy access across devices, it's built using the **MERN stack** (MongoDB, Express, React, Node.js).

---
##Live Demo
https://peernotez.netlify.app/

## 🚀 Features

- 📝 Upload notes in multiple formats (PDF, DOCX, PPTX, PNG)
- 🔍 Search and discover notes by subject, author, or title
- 👥 User authentication (JWT-powered login/signup)
- 💾 Secure cloud storage integration
- 🌐 Responsive design for mobile, tablet, and desktop
- 🎓 Student-friendly UI with dark mode and simplified navigation

---

## 🧰 Tech Stack

| Layer       | Tools Used                |
|------------|---------------------------|
| Frontend   | React, TailwindCSS, Axios |
| Backend    | Node.js, Express.js       |
| Database   | MongoDB (Mongoose ORM)    |
| Auth       | JWT, bcrypt.js            |
| Hosting    | Netlify (Frontend), Render (Backend) |
| SEO        | Sitemap.xml, robots.txt, meta tags |

---

## 📦 Installation
# Clone the repo
git clone https://github.com/AdityaChoudhary01/PeerNotez.git
cd PeerNotez

# Install frontend dependencies
npm install

# Navigate to backend folder and install dependencies
cd server
npm install
🔑 Environment Variables
Create a .env file in the backend directory with:

env
MONGO_URI=your_mongo_connection_string
JWT_SECRET=your_jwt_secret_key
▶️ Run Locally
bash
# Start backend
cd server
npm run dev

# Start frontend
cd ../
npm start
🧠 Contributing
Pull requests are welcome! Whether you're optimizing queries, fixing bugs, or improving UI, feel free to fork the repo and submit your suggestions.

🛡️ License
This project is licensed under the MIT License.

📫 Contact
Made with ❤️ by Aditya Choudhary

Need help or want to collaborate? Reach out via GitHub issues or discussions.

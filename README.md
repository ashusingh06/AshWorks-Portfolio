# 🎬 AshWorks — Netflix-Style Cinematic Portfolio

[![Firebase Hosting](https://img.shields.io/badge/Hosted%20On-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://comrade-portfolio-af0e9.web.app)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](#)
[![CSS3](https://img.shields.io/badge/CSS3-Modern%20Grid%20%26%20Animations-1572B6?style=for-the-badge&logo=css3&logoColor=white)](#)
[![License: ISC](https://img.shields.io/badge/License-ISC-red.svg?style=for-the-badge)](#)

A high-performance, Netflix-inspired interactive developer portfolio designed and built for **Ashish Singh** — Front-End Developer & Management & Data Science student at **IIT Madras**.

🔗 **Live Website:** [https://comrade-portfolio-af0e9.web.app](https://comrade-portfolio-af0e9.web.app)  
👤 **Portfolio Lead:** [Ashish Singh](https://linkedin.com/in/ashish-singh-993689312)  
🐙 **GitHub:** [@ashusingh06](https://github.com/ashusingh06)

---

## ✨ Key Highlights & Features

- **🎬 Netflix Billboard Hero:** Cinematic opening intro, audio cue integration, and billboard hero showcase with smooth play/trailer actions.
- **📄 Interactive Resume Viewer:** One-click modal viewer displaying a high-resolution CV with instant image/PDF download support.
- **📜 The Screenplay (The Full Story):** Clean document-style view of academic milestones, certifications, and research journey.
- **🌌 Skills Universe:** Categorized interactive tech badges (Frontend, Backend, Data Science, Database, Cloud & Tools).
- **🍿 Netflix Originals Showcase:** Responsive project cards and carousels showcasing full-stack projects with live links and tech stacks.
- **⚡ Microsecond Hydration:** Instant render from fallback defaults with silent asynchronous disk & cloud synchronization.
- **📱 Fully Responsive:** Crafted with custom responsive CSS breakpoints for mobile, tablet, and ultra-wide displays.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** HTML5, Modern CSS3 (Grid, Flexbox, Custom Keyframes), Vanilla JavaScript (ES6+)
- **Backend / Server:** Node.js HTTP server (`server.js`) with disk persistence
- **Cloud & Deployment:** Firebase Hosting, Firebase Firestore, Cloudinary
- **Design Inspiration:** Netflix UI / Streaming Dashboard Theme

---

## 📁 Repository Structure

```
.
├── css/
│   ├── intro.css             # Cinematic intro animation styles
│   └── style.css             # Netflix theme, carousel, and responsive styles
├── images/                   # Project cards, banners, avatars, and resume files
├── js/
│   ├── default-data.js       # Standalone portfolio fallback data
│   ├── firebase-config.example.js  # Template for Firebase web app configuration
│   ├── firebase-service.js   # Cloud Firestore and analytics integration
│   ├── intro.js              # Opening cinematic sound and timeline logic
│   └── main.js               # Modal controls, hydration, and event listeners
├── index.html                # Main portfolio single-page application
├── intro.html                # Cinematic teaser splash screen
├── package.json              # Project metadata & start scripts
├── server.js                 # Local Node.js server with JSON endpoints
└── .gitignore                # Excludes secrets, keys, and admin portals
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- A modern web browser

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ashusingh06/AshWorks-Portfolio.git
   cd AshWorks-Portfolio
   ```

2. **Configure Firebase (Optional):**
   Copy the example config and add your keys if using Firebase:
   ```bash
   cp js/firebase-config.example.js js/firebase-config.js
   ```

3. **Start the local server:**
   ```bash
   npm start
   # or
   node server.js
   ```

4. **Open in your browser:**
   ```
   http://localhost:5000
   ```

---

## 🌐 Deployment to Firebase Hosting

To deploy your own instance to Firebase Hosting:

```bash
# Login to Firebase
firebase login

# Deploy hosting
firebase deploy --only hosting
```

---

## 📬 Contact & Connect

- **Email:** [aashishsinghh06@gmail.com](mailto:aashishsinghh06@gmail.com)
- **LinkedIn:** [ashish-singh-993689312](https://linkedin.com/in/ashish-singh-993689312)
- **GitHub:** [@ashusingh06](https://github.com/ashusingh06)

---

⭐ *If you like this project, feel free to give it a star on GitHub!*

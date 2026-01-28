# NeuroView AI - Professional Creative & Intelligence Suite 🧠✨

> **Engineered by Mukesh Chowdary & Team**

**NeuroView** is a state-of-the-art **MERN stack** application designed to bridge the gap between human creativity and artificial intelligence. It features a premium, "Anti-Gravity" inspired UI/UX that emphasizes fluidity, depth, and interactivity.

![NeuroView Banner](https://via.placeholder.com/1200x400.png?text=Summarize+the+World.+Visualize+Your+Dreams.)

> **📘 New to this project?** check out the comprehensive **[Beginner's Guide & Architecture Walkthrough](BEGINNER_GUIDE.md)**!

## 🚀 Key Features

### 1. **AI Image Generation (NeuroArt)**
*   **Powered By**: **Stable Diffusion XL** (via Hugging Face).
*   **Functionality**: Users can input text prompts to generate high-fidelity, imaginative images ("Visualize Your Dreams").
*   **Key Tech**: `@huggingface/inference` SDK integrated securely on the backend.
*   **Community Showcase**: A masonry-grid gallery displaying community creations with **Advanced Search**, **Model/Color Fitlering**, and **staggered animations**.

### 2. **AI Text Intelligence (NeuroSense)**
*   **Summarizer & Translator**: Instantly condenses long articles or translates them into over 15 languages using **Facebook BART** & **MBART-50**.
*   **Intelligent Web Scraper**: Powered by `cheerio`, it filters out ads, scripts, and noise to extract only meaningful content from URLs.
*   **Smart Language Detection**: Automatically handles various input languages.
*   **Advanced Export**: "What You See Is What You Get" PDF export preserving emojis and foreign scripts.
*   **Web Summaries**: A dedicated community section to share and browse interesting text summaries.

### 3. **Premium "Anti-Gravity" UI/UX**
*   **Theme**: "Mineral Dark" aesthetic with deep, living gradients.
*   **Glassmorphism**: Extensive use of backdrop blurs not just for visuals, but for hierarchy.
*   **Interactive Cards**: "Instagram-style" hover actions with "Pop-out" buttons.

### 4. **Professional "Creative Studio" Features (New! 2026)**
*   **🔐 User Authentication**: Secure Login/Register system with JWT validation and personalized profiles.
*   **🌲 Remix Genealogy**: Visualize the "Family Tree" of any image! Click the lightning bolt to see the Parent → Current → Children relationships in a stunning interactive modal.
*   **🎨 Auto-Palette**: AI automatically extracts the **5 Dominant Colors** from every generated image and displays them as a visual palette.
*   **🔍 Advanced Filtering**: Find the perfect inspiration by filtering posts by **AI Model** or **Dominant Color**.
*   **📂 Mood Boards (Collections)**: Organize your favorite inspirations into curated, private or public boards.
*   **👤 User Profiles**: A dedicated space to manage your Creations, Remixes, and Collections.

### 5. **Premium "Gloss Morph" UI/UX (v2.0)**
*   **🎴 Holographic 3D Tilt Cards**: Cards respond to mouse position with 3D rotation and dynamic glare.
*   **✨ Glass Card Borders**: Animated gradient glow that shimmers cyan → purple → pink on hover.
*   **🎉 Confetti Burst**: Success celebrations with particle confetti on image generation.
*   **🔢 Animated Counter**: Stats count up from 0 for a "live dashboard" feel.
*   **💀 Skeleton Shimmer**: Premium loading placeholders instead of spinners.
*   **🖱️ Custom Cursor**: Glowing orb that follows the mouse and expands on interactive elements.
*   **🌊 Parallax Scroll**: Hero elements move at different speeds for cinematic depth.
*   **🎙️ Voice Input (STT)**: Speak your prompts with a pulsing microphone button.
*   **😮‍💨 Breathing UI**: Subtle pulse animation on static elements like the logo.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js, Tailwind CSS, Custom Animation Hooks, ColorThief (Analysis), html2canvas.
*   **Backend**: Node.js, Express.js, Cheerio (Scraping), Franc (Language Detection).
*   **Database**: MongoDB (Schemaless flexibility for Art & Text).
*   **Security**: BCrypt (Hashing), JWT (Sessions), Nodemailer (Verification).
*   **Cloud Storage**: Cloudinary (Image hosting).
*   **AI Integration**: Hugging Face (Images, Translation, Summarization), Google Gemini (Summarization).
*   **UI/UX**: TiltCard, CustomCursor, Confetti, SkeletonCard, MagneticButton components.

---

## ⚙️ Installation & Setup

### Prerequisites

1.  **Node.js (v18+)**
2.  **MongoDB Compass (Local)**
3.  **Cloudinary Account**
4.  **Hugging Face API Token** (`HP_TOKEN`) (Free)

### 1. Clone the Repository
```bash
git clone https://github.com/mukesh-chowdary/neuroview-ai.git
cd neuroview-ai
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
# Ensures cheerio and franc, openai are installed
```

Create a `.env` file in the `server` directory:
```env
MONGODB_URL=mongodb://localhost:27017/neuroview
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
HP_TOKEN=your_hugging_face_token
OPENAI_API_KEY=your_openai_key
PORT=8080
```

Start the Server:
```bash
npm start
```
*Server will run on http://localhost:8080*

### 3. Frontend Setup
Open a new terminal, navigate to the client directory:
```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```env
# Point to your local backend
REACT_APP_BASE_URL=http://localhost:8080/api/v1

# Required for Summarizer (URL Extraction fallback)
REACT_APP_RAPID_API_KEY=your_rapid_api_key
```

Start the Client:
```bash
npm run dev
# OR
npm start
```
*Client will run on http://localhost:3000 (or 5173)*

---

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a pull request for review.

---

**© 2026 NeuroView AI**. | **Engineered by Mukesh Chowdary & Team**

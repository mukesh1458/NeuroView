# NeuroView AI - Professional Creative & Intelligence Suite 🧠✨

> **Engineered by Mukesh Chowdary & Team**

**NeuroView** is a state-of-the-art **MERN stack** application designed to bridge the gap between human creativity and artificial intelligence. It features a premium, "Anti-Gravity" inspired UI/UX that emphasizes fluidity, depth, and interactivity.

![NeuroView Banner](https://via.placeholder.com/1200x400.png?text=Summarize+the+World.+Visualize+Your+Dreams.)

> **📘 New to this project?** check out the comprehensive **[Beginner's Guide & Architecture Walkthrough](BEGINNER_GUIDE.md)**!

## 🚀 Key Features

### 1. **AI Image Generation (NeuroArt)**
*   **Powered By**: Stable Diffusion models hosted on Hugging Face.
*   **Functionality**: Users can input text prompts to generate high-fidelity, imaginative images ("Visualize Your Dreams").
*   **Key Tech**: `@huggingface/inference` SDK integrated securely on the backend.
*   **Community Showcase**: A masonry-grid gallery displaying community creations with **Advanced Search**, **Model/Color Fitlering**, and **staggered animations**.

### 2. **AI Text Intelligence (NeuroSense)**
*   **Summarizer**: Instantly condenses long articles or text blocks into concise, digestible summaries ("Study Smarter, Not Harder").
*   **Hybrid Translation Engine**: 
    *   **URLs**: Uses **RapidAPI** (`article-extractor-and-summarizer`) for robust web extraction and translation.
    *   **Text**: Uses **Local Backend** (`Hugging Face mBART`) for unlimited text-to-text translation.
*   **Web Summaries**: A dedicated community section to share and browse interesting text summaries.
*   **UI**: Features a split-screen glassmorphism interface for input/output comparison.

### 3. **Premium "Anti-Gravity" UI/UX**
*   **Theme**: "Mineral Dark" aesthetic with deep, living gradients.
*   **Glassmorphism**: Extensive use of backdrop blurs not just for visuals, but for hierarchy.
*   **Interactive Cards**: "Instagram-style" hover actions with "Pop-out" buttons.

### 4. **Professional "Creative Studio" Features (New! 2026)**
*   **🔐 User Authentication**: Secure Login/Register system with JWT validation and personalized profiles.
*   **🌲 Remix Genealogy**: Visualize the "Family Tree" of any image! Click the lightning bolt to see the Parent → Current → Children relationships in a stunning interactive modal.
*   **🎨 Auto-Palette**: AI automatically extracts the **5 Dominant Colors** from every generated image and displays them as a visual palette.
*   **🔍 Advanced Filtering**: Find the perfect inspiration by filtering posts by **AI Model** (Stable Diffusion, DALL-E) or **Dominant Color**.
*   **📂 Mood Boards (Collections)**: Organize your favorite inspirations into curated, private or public boards.
*   **👤 User Profiles**: A dedicated space to manage your Creations, Remixes, and Collections.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js (Vite), Tailwind CSS, Framer Motion, ColorThief (Analysis).
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Schemaless flexibility for Art & Text).
*   **Security**: BCrypt (Hashing), JWT (Sessions), Nodemailer (Verification).
*   **Cloud Storage**: Cloudinary (Image hosting).
*   **AI Integration**: Hugging Face Inference API, RapidAPI.

---

## ⚙️ Installation & Setup

### Prerequisites

1.  **Node.js (v18+)**
2.  **MongoDB Compass (Local)**
3.  **Cloudinary Account**
4.  **Hugging Face API Token**
5.  **RapidAPI Key**

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
```

Create a `.env` file in the `server` directory:
```env
MONGODB_URL=mongodb://localhost:27017/neuroview
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
HF_ACCESS_TOKEN=your_hugging_face_token
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

# Required for Summarizer (URL Extraction)
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

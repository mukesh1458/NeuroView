# Technical Code Reference

This document outlines the specific file locations and code snippets for the core integrations in NeuroView.

## 1. Hugging Face (Image Generation)
**File:** `server/routes/dalleRoutes.js`

*   **Initialization:**
    We use the `@huggingface/inference` library initialized with a token.
    ```javascript
    import { HfInference } from "@huggingface/inference";
    const hf = new HfInference(process.env.HP_TOKEN);
    ```

*   **Generation Logic:**
    We use the **Stable Diffusion XL** model for high-quality image generation, tuned with specific inference steps.
    ```javascript
    const response = await hf.textToImage({
        model: "stabilityai/stable-diffusion-xl-base-1.0",
        inputs: prompt,
        parameters: { 
            negative_prompt: "blurry, low quality...",
            guidance_scale: 7.5, // Strictness of prompt adherence
            num_inference_steps: 50 // Denoising steps for higher fidelity
        }
    });
    ```

## 2. Cloudinary Configuration (Image Storage)
**File:** `server/routes/postRoutes.js`

*   **Configuration:**
    Cloudinary is configured globally for the router using environment variables.
    ```javascript
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    ```

## 3. Web Intelligence (Hybrid Architecture)
**File:** `client/src/pages/Summarize.jsx` & `server/routes/summaryRoutes.js`

We use a **Hybrid Strategy** to ensure maximum efficiency:

*   **URL Processing (RapidAPI):**
    For extracting and summarizing articles from URLs, we use the robust **Article Extractor API** (via RapidAPI). This handles cleaning, summarization, and translation in one step.
    ```javascript
    // Summarize.jsx
    const rapidData = await summarizeFromUrl(article.data, target);
    ```

*   **Text Summarization (RapidAPI):**
    Pure text summarization also leverages RapidAPI's `text-summarize-pro` for speed and quality.
    ```javascript
    // Summarize.jsx
    const rapidData = await summarizeFromText(article.data);
    ```

*   **Text Translation (Local Backend):**
    For direct text translation, we use our private **Hugging Face mBART** instance on the backend for privacy and control.
    ```javascript
    // summaryRoutes.js
    const translation = await hf.translation({ model: 'facebook/mbart-large-50...' });
    ```

## 4. Client-Side Enhancements
**File:** `client/src/pages/Summarize.jsx`

*   **Printable PDF Export:**
    Uses `html2canvas` to clone the summary content, apply "White Paper" styling (white background, black text), and generate a clean PDF.
    ```javascript
    const clone = element.cloneNode(true);
    Object.assign(clone.style, { backgroundColor: '#ffffff', color: '#000000', ... });
    ```
*   **Multi-Language TTS:**
    Features a dual-engine TTS system:
    1.  **Local**: Tries to find a matching OS voice.
    2.  **Cloud Fallback**: Connects to Google Cloud TTS for missing languages (e.g., Hindi).

## 5. Environment Variables Reference
Ensure these are set in your `.env` files:

*   **Server:** `HP_TOKEN`, `CLOUD_NAME`, `API_KEY`, `API_SECRET`
*   **Client:** `REACT_APP_RAPID_API_KEY`

## 6. Mongoose Models & Schema Design
**File:** `server/models/post.js`

We use **Mongoose Schemas** to define the structure of our data. This ensures consistency and allows us to easily relate data (like linking a Post to a User).

*   **Schema Definition:**
    Defines the "shape" of a Post document.
    ```javascript
    const Post = new mongoose.Schema({
        name: { type: String, required: true },
        prompt: { type: String, required: true },
        photo: { type: String, required: true }, // URL from Cloudinary
        user: {
            type: mongoose.Schema.Types.ObjectId, // Links to the User model
            ref: 'User',
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId, // Self-referencing for Remixes
            ref: 'Post',
            default: null,
        },
        colors: { type: [String], default: [] } // Array of strings for color analysis
    });
    ```

*   **Tuning & Relationships:**
    - `ref: 'User'` allows us to use `.populate('user')` in our queries to instantly get user details (username, email) along with the post data, without making a second database call.
    - `parentId` creates a "Tree" structure, allowing us to track which post was "remixed" from another.

## 7. Route Integration & Middleware
**File:** `server/routes/postRoutes.js` & `server/index.js`

Routes define how the outside world talks to our server. We use **Middleware** to protect these routes.

*   **Route Protection (Middleware):**
    The `verifyToken` middleware checks the JWT before allowing access.
    ```javascript
    // postRoutes.js
    import verifyToken from '../middleware/auth.js';

    // Only logged-in users can create posts
    router.post("/post", verifyToken, async (req, res) => {
        // req.user is now available here because verification passed
        const { name, prompt, model } = req.body;
        // ... logic to create post
    });
    ```

*   **Cloudinary Integration in Routes:**
    We handle file uploads directly in the route before saving to MongoDB.
    ```javascript
    // Upload image to Cloudinary first
    const photoURL = await cloudinary.uploader.upload(photo.tempFilePath, {
        folder: process.env.FOLDER_NAME,
        resource_type: "auto"
    });
    
    // Then save the URL to our database
    const newPost = await Post.create({
        // ...
        photo: photoURL.url,
        // ...
    });
    ```

*   **Global Route Registration:**
    All routes are gathered in `index.js` and prefixed with `/api/v1`.
    ```javascript
    // index.js
    import postRoutes from './routes/postRoutes.js';
    
    app.use('/api/v1', postRoutes); // e.g., becomes /api/v1/post
    ```

---

## 8. Premium UI/UX Components
**Directory:** `client/src/components/`

### A. Micro-Interaction Components
| Component | File | Description |
|-----------|------|-------------|
| `TiltCard` | `TiltCard.jsx` | 3D holographic tilt effect with glare overlay |
| `CustomCursor` | `CustomCursor.jsx` | Glowing orb cursor with reactive states |
| `Confetti` | `Confetti.jsx` | Particle burst celebration on success |
| `SkeletonCard` | `SkeletonCard.jsx` | Shimmer loading placeholder |
| `MagneticButton` | `MagneticButton.jsx` | Cursor-attracting button wrapper |

### B. Custom Animation Hooks
**File:** `client/src/hooks/useAnimations.js`

```javascript
// Animated Counter (counts up from 0)
const animatedCount = useAnimatedCounter(endValue, duration, startOnMount);

// Ripple Click Effect (Material Design style)
const createRipple = useRipple();
<button onClick={createRipple} className="ripple-effect">Click</button>

// Scroll-Triggered Reveal (Intersection Observer)
const [ref, isVisible] = useScrollReveal(threshold);
<div ref={ref} className={isVisible ? 'visible' : ''}>Content</div>
```

### C. CSS Animation Classes
**File:** `client/src/index.css`

| Class | Effect |
|-------|--------|
| `.glass-border` | Animated gradient glow border on hover |
| `.hover-glow` | Soft aura radiates on hover |
| `.elastic-input` | Input expands slightly on focus |
| `.text-reveal` | Truncated text expands on hover |
| `.animate-breathe` | Subtle pulse animation |
| `.scroll-reveal` | Fade-in on scroll with stagger delays |
| `.ripple-effect` | Container for Material ripple |
| `.shimmer` | Skeleton loading shimmer effect |

### D. Voice Input (STT)
**Files:** `client/src/hooks/useSpeechToText.js`, `client/src/components/FormField.jsx`

```javascript
// Hook usage
const { isListening, transcript, startListening, stopListening, hasSupport } = useSpeechToText();

// Append transcript to prompt
useEffect(() => {
  if (transcript) {
    setForm(prev => ({ ...prev, prompt: prev.prompt + ' ' + transcript }));
  }
}, [transcript]);
```


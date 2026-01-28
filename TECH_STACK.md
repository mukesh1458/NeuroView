# Technology Stack Guide



## Backend (Server-Side)
The "Brain" of the application that handles data, logic, and AI processing.

### Core Frameworks
1.  **Node.js**: A runtime environment that lets us run JavaScript on the server (outside the browser). It's the foundation of our backend.
2.  **Express.js**: A framework built on top of Node.js. It simplifies building web servers, handling API requests (like "get all posts" or "login user"), and managing routes.
3.  **Nodemon**: A utility that automatically restarts the server whenever we save code changes. It saves us from manually stopping and starting the server every time.

### Database
4.  **MongoDB**: A NoSQL database that stores data in JSON-like documents. It's flexible and scalable.
5.  **Mongoose**: A library that bridges Node.js and MongoDB. It allows us to define "Schemas" (blueprints) for our data (e.g., a "Post" *must* have a name and an image) so we interact with the database in a structured way.

### Authentication & Security
6.  **JsonWebToken (JWT)**: A standard for securely transmitting information between parties as a JSON object. We use it to create "tokens" that prove a user is logged in.
7.  **Bcryptjs**: A library to "hash" (scramble) passwords before saving them. This ensures that even if our database is hacked, actual user passwords remain secret.
8.  **Cors**: "Cross-Origin Resource Sharing". It's a security feature that allows our frontend (running on one port) to talk to our server (running on another port).

### Cloud & Media
9.  **Cloudinary**: A cloud service for managing images and videos. We upload user-generated images here and store only the *link* in our database, which keeps our database fast and light.
10. **Express-FileUpload**: A middleware that helps our Express server handle file uploads (like images) easily.

### Artificial Intelligence & Utilities
11. **@huggingface/inference**: A library to connect with Hugging Face's AI models. We use this for translation and other AI tasks.
12. **Stable Diffusion (via Hugging Face)**: Used for generating high-quality images based on text prompts. Replaces DALL-E.
13. **Cheerio**: A tool that essentially "reads" HTML from websites. We use it to scrape text from articles for summarization.
14. **Franc**: A library to detect the language of a text snippet.
15. **Dotenv**: key-value pairs from a `.env` file into `process.env`. This keeps our secret API keys safe and out of the code.

---

## Frontend (Client-Side)
The "Face" of the application that you interact with.

### Frameworks & Libraries
16. **React.js**: A library for building user interfaces. It lets us build reusable "Components" (like buttons, navbars, cards) that manage their own state.
17. **React-DOM**: The glue that attaches React components to the actual web page (the DOM).
18. **React-Scripts**: A set of scripts from "Create React App" that handles building, testing, and starting the React development server.

### Navigation & State
19. **React-Router-Dom**: Handles navigation between pages (e.g., going from Home to Profile) without reloading the entire website.
20. **Redux Toolkit & React-Redux**: specific tool for managing "Global State". It allows different parts of the app to share data easily (though we also use Context API).

### Styling & UI

21. **TailwindCSS**: A utility-first CSS framework. Instead of writing separate CSS files, we add classes like `flex`, `p-4`, `text-white` directly to our HTML.
22. **PostCSS & Autoprefixer**: Tools that process our CSS to make sure it works on all different browsers automatically.
23. **React-Icons**: A huge library of icons (like FontAwesome, Material Design) that we can import as React components.
24. **React-Hot-Toast**: A library for showing beautiful "toast" notifications (popups) like "Login Successful" or "Error Occurred".

### Utilities
25. **Axios**: A library for making HTTP requests (like fetching data) to our backend. It's easier to use than the built-in `fetch`.
26. **File-Saver**: A helper to trigger file downloads (like saving the generated image) directly in the browser.
27. **JSPDF & HTML2Canvas**: Libraries used together to take a "screenshot" of a webpage section (like a summary) and turn it into a downloadable PDF file.
28. **ColorThief**: Extracts the dominant colors from an image. We use this to analyze generated images.

---

## Premium UI/UX Features

### Micro-Interactions & Animations
29. **Holographic 3D Tilt Cards**: Cards respond to mouse position with 3D rotation and dynamic glare effect, creating a physical glass-like feel.
30. **Custom Cursor**: A glowing orb that follows the mouse and expands when hovering over interactive elements.
31. **Glass Card Borders**: Animated gradient glow borders that shimmer through cyan, purple, and pink on hover.
32. **Confetti Burst**: Success celebrations with particle confetti on image generation.
33. **Parallax Scroll**: Hero section elements move at different speeds when scrolling for cinematic depth.
34. **Animated Counter**: Stats count up from 0 when the page loads for a "live dashboard" feel.
35. **Skeleton Shimmer**: Loading placeholders with a shimmering effect instead of spinners.
36. **Elastic Input Fields**: Inputs subtly expand on focus for tactile feedback.
37. **Breathing UI**: Subtle pulse animation on static elements like the logo.
38. **Hover Glow Aura**: Soft glow radiates from buttons and links on hover.
39. **Text Reveal on Hover**: Truncated text smoothly expands to show full content.

### Custom Components
- `TiltCard.jsx`: Reusable 3D tilt wrapper with glare effect
- `CustomCursor.jsx`: Global custom cursor with reactive states
- `Confetti.jsx`: Particle burst celebration component
- `SkeletonCard.jsx`: Shimmer loading placeholder
- `MagneticButton.jsx`: Cursor-attracting button wrapper

### Custom Hooks (`hooks/useAnimations.js`)
- `useAnimatedCounter`: Smooth number counting animation
- `useRipple`: Material-style ripple click effect
- `useScrollReveal`: Intersection Observer for scroll-triggered reveals

### Voice Interface
40. **Speech-to-Text (STT)**: Voice input for prompts using the Web Speech API with a premium pulsing microphone button.


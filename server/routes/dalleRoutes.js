import express from "express";
import * as dotenv from 'dotenv';
import { HfInference } from "@huggingface/inference";

dotenv.config();

const router = express.Router();
const hf = new HfInference(process.env.HP_TOKEN);

router.post('/dalle', async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log("Generating image for prompt (HF):", prompt);

        // Usage of Stable Diffusion XL
        const response = await hf.textToImage({
            model: "stabilityai/stable-diffusion-xl-base-1.0",
            inputs: prompt,
            parameters: {
                negative_prompt: "blurry, low quality, bad anatomy"
            }
        });

        // Response is a Blob/Buffer. Convert to Base64.
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const image = `data:image/jpeg;base64,${base64Image}`;

        res.status(200).json({ photo: image });

    } catch (error) {
        console.error("Image Gen Error:", error);
        res.status(500).json({
            success: false,
            message: "Image generation failed.",
            error: error.message
        });
    }
});

export default router;
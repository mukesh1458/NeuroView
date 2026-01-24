import express from "express";
import * as dotenv from 'dotenv'
import { HfInference } from '@huggingface/inference';

dotenv.config();

const router = express.Router()
const hf = new HfInference(process.env.HP_TOKEN);

router.post('/dalle', async (req, res) => {
    const { prompt } = req.body;
    console.log("Prompt:", prompt);

    try {
        // Using the SDK automatically handles the correct endpoint
        const response = await hf.textToImage({
            model: 'stabilityai/stable-diffusion-xl-base-1.0',
            inputs: prompt,
        });

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.set("Content-Type", "image/jpeg");
        res.status(200).send(buffer);

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
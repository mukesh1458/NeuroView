import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBJYdajaZtZnsBm0xfewW4EsJl61FDPyv8";
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Write a short poem about coding.";
        console.log("Testing Gemini API with provided key...");
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log("SUCCESS! API Key is valid.");
        console.log("Response:", text);
    } catch (error) {
        console.error("FAILED: API Key validation failed.");
        console.error("Error details:", error.message);
        if (error.response) {
            console.error("Full Error Response:", JSON.stringify(error.response, null, 2));
        }
    }
}

run();

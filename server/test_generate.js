import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBJYdajaZtZnsBm0xfewW4EsJl61FDPyv8";
const genAI = new GoogleGenerativeAI(apiKey);

const modelsIdx = ["gemini-1.5-flash", "gemini-pro", "gemini-1.0-pro", "gemini-1.5-pro-latest"];

async function run() {
    for (const mName of modelsIdx) {
        try {
            console.log(`Testing generation with ${mName}...`);
            const model = genAI.getGenerativeModel({ model: mName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`SUCCESS with ${mName}:`, response.text());
            return; // Exit on first success
        } catch (error) {
            console.error(`FAILED with ${mName}: ${error.message} \nStatus: ${error.response ? error.response.status : 'Unknown'}`);
        }
    }
}

run();


// This script requires Node 18+ or a fetch polyfill
// but we just want to see if we can hit the discovery endpoint.

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyBJYdajaZtZnsBm0xfewW4EsJl61FDPyv8";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // Direct access via global fetch if SDK fails
        // using the REST API directly to verify key permissions
        console.log("Attempting REST API check...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("REST API Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("SUCCESS! Available Models:");
            data.models.forEach(m => console.log(`- ${m.name}`));
        }

    } catch (error) {
        console.error("FAILED to list models.");
        console.error(error);
    }
}

listModels();

import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1';

async function testSummaryURL() {
    console.log("--- Testing Summary (URL) [RapidAPI] ---");
    try {
        const res = await axios.post(`${BASE_URL}/summary`, {
            url: 'https://en.wikipedia.org/wiki/Artificial_intelligence'
        });
        console.log("SUCCESS:", res.data);
    } catch (error) {
        console.error("FAILED:", error.response ? error.response.data : error.message);
    }
}

async function testSummaryText() {
    console.log("\n--- Testing Summary (Text) [HuggingFace] ---");
    try {
        const res = await axios.post(`${BASE_URL}/summary`, {
            text: 'Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. Leading AI textbooks define the field as the study of "intelligent agents": any system that perceives its environment and takes actions that maximize its chance of achieving its goals. Some popular accounts use the term "artificial intelligence" to describe machines that mimic "cognitive" functions that humans associate with the human mind, such as "learning" and "problem solving".'
        });
        console.log("SUCCESS:", res.data);
    } catch (error) {
        console.error("FAILED:", error.response ? error.response.data : error.message);
    }
}

async function testTranslate() {
    console.log("\n--- Testing Translate [HuggingFace] ---");
    try {
        const res = await axios.post(`${BASE_URL}/translate`, {
            text: 'Hello world, this is a test.',
            target_lang: 'Spanish'
        });
        console.log("SUCCESS:", res.data);
    } catch (error) {
        console.error("FAILED:", error.response ? error.response.data : error.message);
    }
}

async function runTests() {
    await testSummaryURL();
    await testSummaryText();
    await testTranslate();
}

runTests();

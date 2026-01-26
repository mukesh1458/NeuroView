
const apiKey = "AIzaSyBJYdajaZtZnsBm0xfewW4EsJl61FDPyv8";

async function run() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [{
            parts: [{ text: "Hello" }]
        }]
    };

    try {
        console.log(`Testing REST API: ${url}`);
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("REST API FAILED:");
            console.error(`Status: ${response.status} ${response.statusText}`);
            console.error(JSON.stringify(data, null, 2));
        } else {
            console.log("REST API SUCCESS!");
            console.log(JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Network Error:", error);
    }
}

run();

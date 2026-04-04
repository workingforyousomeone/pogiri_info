const express = require('express');
const axios = require('axios');
const app = express().use(express.json());

const TOKEN = "EAANbuq79KEgBRKew9YTZCYEeSt5oYha17Bfav6RbkCpvRFiA8ZCw8H9vUK7ZCRZAmBbDMCxKZC4VpKk5mHCxeoC0LC4PFpHyZCiLKBFMFrMwEE7NZCG8lQFZBLAExThh2o2nsZC7CwtFeN1u2ROzyxEh01FwlzXIAgUx2JvZA7cc7CZBuUACOFmt8aZB9IXZBRWvoFEy9gWHI9Y62GzDj6990Kj4fZB6ZCktaZBEzhvU0e3m1E3ljHK1wkwnAyB1hUSzmYrSkLyH6kIjNZAzmfrvw0Rje2UMqqQZDZD";
const PHONE_ID = "1022576120942370"; // API Setup పేజీలో ఉంటుంది

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === "pogiri_gp_2026") {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', async (req, res) => {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.type === 'text') {
        const from = message.from; 
        const msgText = message.text.body;
        console.log(`📩 మెసేజ్ వచ్చింది: ${msgText} from ${from}`);

        try {
            // వాట్సాప్ రిప్లై పంపడం
            await axios.post(`https://graph.facebook.com/v22.0/${PHONE_ID}/messages`, {
                messaging_product: "whatsapp",
                to: from,
                text: { body: "నమస్కారం! పొగిరి గ్రామ పంచాయతీ బాట్‌కు స్వాగతం. మీ వివరాలు త్వరలో అందుతాయి." }
            }, { 
                headers: { 'Authorization': `Bearer ${TOKEN}` } 
            });
            console.log("✅ రిప్లై పంపబడింది!");
        } catch (error) {
            console.error("❌ రిప్లై పంపడంలో ఎర్రర్:", error.response ? error.response.data : error.message);
        }
    }
    res.sendStatus(200);
});

// పాత 8080 తీసేసి ఇలా పెట్టండి
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 బాట్ పోర్ట్ ${PORT} లో రన్ అవుతోంది...`);
});

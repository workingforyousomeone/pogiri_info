const express = require('express');
const axios = require('axios');
const app = express().use(express.json());

const TOKEN = "69937b2b8e731f235a946992b217c0e4";
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

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 బాట్ రన్ అవుతోంది...`));

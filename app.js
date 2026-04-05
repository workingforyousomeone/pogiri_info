const axios = require('axios');
const express = require('express');
const app = express().use(express.json());

const TOKEN = "EAANbuq79KEgBRJvS6tUXfzsCeV3B0rRiqrAH0Sf5PXdpOX2Jxnm9mdbzQ1KG7xxu3QgvNxSgPtlUbkIdKzomLA6JYt8V7PSRYZAD5ELeDQ2NzesPZCGLsnSL7c2n6OZCqdMhSXaugz0wpvGPLymqNLwdJZAcb7BtgYlbDZB0gwC64M2TdPRpPWIeajlSR8r4AYFGLvpWXNBPZCNwbdp2nIAWmfWZASMTZBU55pZBWrXuzTlkSPb8oGEh2AiwvN159FIfjI1b1btZAZAdTCW6NW0C312"; 
const PHONE_ID = "1022576120942370"; // మీ లాగ్స్ ప్రకారం ఇదే మీ ఫోన్ ఐడి

app.post('/webhook', async (req, res) => {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.type === 'text') {
        const from = message.from; 
        const msgText = message.text.body;
        console.log(`📩 మెసేజ్ వచ్చింది: ${msgText} from ${from}`);

        try {
            // వాట్సాప్ రిప్లై పంపడం
            const response = await axios({
                method: "POST",
                url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: { body: "నమస్కారం! పొగిరి గ్రామ పంచాయతీ బాట్ పని చేస్తోంది. మీ వివరాలు త్వరలో అందుతాయి." }
                },
                headers: { 
                    "Authorization": `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                }
            });
            console.log("✅ రిప్లై విజయవంతంగా పంపబడింది!");
        } catch (error) {
            console.error("❌ రిప్లై పంపడంలో ఎర్రర్:", error.response ? error.response.data : error.message);
        }
    }
    res.sendStatus(200);
});

// వెరిఫికేషన్ కోసం (గతంలో మీరు చేసినట్లే ఉంచండి)
app.get('/webhook', (req, res) => {
    const token = "pogiri_gp_2026";
    if (req.query['hub.verify_token'] === token) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 బాట్ సిద్ధంగా ఉంది!`));

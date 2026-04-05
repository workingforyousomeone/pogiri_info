const axios = require('axios');
const express = require('express');
const app = express().use(express.json());

const TOKEN = "EAANbuq79KEgBRJvS6tUXfzsCeV3B0rRiqrAH0Sf5PXdpOX2Jxnm9mdbzQ1KG7xxu3QgvNxSgPtlUbkIdKzomLA6JYt8V7PSRYZAD5ELeDQ2NzesPZCGLsnSL7c2n6OZCqdMhSXaugz0wpvGPLymqNLwdJZAcb7BtgYlbDZB0gwC64M2TdPRpPWIeajlSR8r4AYFGLvpWXNBPZCNwbdp2nIAWmfWZASMTZBU55pZBWrXuzTlkSPb8oGEh2AiwvN159FIfjI1b1btZAZAdTCW6NW0C312".trim(); 
const PHONE_ID = "1022576120942370"; // మీ లాగ్స్ ప్రకారం ఇదే మీ ఫోన్ ఐడి
// టెస్టింగ్ కోసం ఒక చిన్న డేటాబేస్ (Array)
const pallaData = [
    { id: "211320000001", name: "BURADA MANGANNA", phone: "9573322733", total: "323" },
    { id: "211320000002", name: "YENUGUTHALA SRIRAM MURTHY", phone: "8186958188", total: "201" },
    // ఇలా మీ డేటా అంతా ఇక్కడ ఉంటుంది...
];



app.post('/webhook', async (req, res) => {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.type === 'text') {
        const from = message.from;
        const input = message.text.body.trim(); // యూజర్ పంపిన అసెస్మెంట్ నంబర్

        // డేటాలో వెతకడం
        const result = pallaData.find(item => item.id === input || item.phone === input);

        let replyMessage = "";
        if (result) {
            replyMessage = `📊 *పొగిరి గ్రామ పంచాయతీ వివరాలు*\n\n` +
                           `👤 పేరు: ${result.name}\n` +
                           `🆔 అసెస్మెంట్ నం: ${result.id}\n` +
                           `💰 మొత్తం బకాయి: ₹${result.total}\n\n` +
                           `దయచేసి మీ పన్నును సకాలంలో చెల్లించి గ్రామ అభివృద్ధికి సహకరించండి.`;
        } else {
            replyMessage = "క్షమించండి! ఆ నంబర్‌తో ఎటువంటి వివరాలు లేవు. దయచేసి సరైన అసెస్మెంట్ నంబర్ పంపండి.";
        }

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

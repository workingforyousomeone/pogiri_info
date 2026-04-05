const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// --- మీ వివరాలు ఇక్కడ మార్చండి ---
const TOKEN = "EAANbuq79KEgBRNywQzNxUMSzeThOiDf2NLOu2AGV4OXaZBG4yQhR4edZC1p8IAWuzlli3bddmSnjZCZAIPKZA0hj9VdzAK667KZCnd7e18suAvAzKrmrDOCrm6TEzUlnbdx6Jt86ZBKPIuec8rS66q9fui5DcWcXPytdCJ4vZCvzGEi8bM2doCZBPZAZAqBrGnKRQZDZD".trim(); 
const PHONE_ID = "1022576120942370";
const SPREADSHEET_ID = "1Odobo-H043KZKfYdNpeyMADeEa7wb-k-UyLXD1n_sBM";
const VERIFY_TOKEN = "pogiri_gp_2026"; 

// --- గూగుల్ షీట్ నుండి డేటా వెతికే ఫంక్షన్ ---
async function getSheetData(userInput) {
    try {
        // షీట్‌ను CSV ఫార్మాట్‌లో డౌన్‌లోడ్ చేయడం (సులభమైన పద్ధతి)
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;
        const response = await axios.get(url);
        const rows = response.data.split('\n').map(row => row.split(',').map(cell => cell.replace(/"/g, '').trim()));

        // హెడర్ ఇండెక్స్‌లు కనుగొనడం
        const headers = rows[0];
        const assessIdx = headers.indexOf("Assessment No");
        const nameIdx = headers.indexOf("Name");
        const guardIdx = headers.indexOf("Guardian");
        const phoneIdx = headers.indexOf("Phone");
        const dy25Idx = headers.indexOf("DY2025-26");
        const cy25Idx = headers.indexOf("CY2025-26");

        // యూజర్ పంపిన నంబర్ కోసం వెతకడం (Assessment No లేదా Phone)
        const findRow = rows.find(r => r[assessIdx] === userInput || r[phoneIdx] === userInput);

        if (findRow) {
            return `📊 *పొగిరి గ్రామ పంచాయతీ వివరాలు*\n\n` +
                   `👤 పేరు: *${findRow[nameIdx]}*\n` +
                   `👨‍💼 తండ్రి/భర్త: ${findRow[guardIdx]}\n` +
                   `🆔 అసెస్‌మెంట్ నం: ${findRow[assessIdx]}\n` +
                   `--------------------------\n` +
                   `💰 పాత బకాయి (DY): ₹${findRow[dy25Idx]}\n` +
                   `📅 ప్రస్తుత పన్ను (CY): ₹${findRow[cy25Idx]}\n` +
                   `✅ *మొత్తం చెల్లించాల్సింది: ₹${Number(findRow[dy25Idx]) + Number(findRow[cy25Idx])}*`;
        }
        return null;
    } catch (error) {
        console.error("Sheet Error:", error.message);
        return "error";
    }
}

// --- వెబ్‌హుక్ వెరిఫికేషన్ (GET) ---
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

// --- మెసేజ్ హ్యాండ్లింగ్ (POST) ---
app.post('/webhook', async (req, res) => {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.type === 'text') {
        const from = message.from; 
        const userInput = message.text.body.trim();

        console.log(`📩 Request for: ${userInput}`);

        // డేటా వెతకడం
        const result = await getSheetData(userInput);

        let replyText = "";
        if (result === "error") {
            replyText = "సర్వర్ ఇబ్బంది వల్ల డేటా దొరకలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.";
        } else if (result) {
            replyText = result;
        } else {
            replyText = "క్షమించండి! ఆ అసెస్‌మెంట్ నంబర్ లేదా ఫోన్ నంబర్‌తో ఎటువంటి వివరాలు లేవు. దయచేసి సరైన నంబర్ పంపండి.";
        }

        // వాట్సాప్ రిప్లై పంపడం
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
                data: {
                    messaging_product: "whatsapp",
                    to: from,
                    text: { body: replyText }
                },
                headers: { 
                    "Authorization": `Bearer ${TOKEN}`,
                    "Content-Type": "application/json"
                }
            });
            console.log("✅ Reply Sent!");
        } catch (err) {
            console.error("❌ Send Error:", err.response ? err.response.data : err.message);
        }
    }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Pogiri GP Bot is live on port ${PORT}`));

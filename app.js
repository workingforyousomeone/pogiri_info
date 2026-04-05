const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// --- 1. మీ వివరాలు ఇక్కడ ఖచ్చితంగా అప్‌డేట్ చేయండి ---
const TOKEN = "EAANbuq79KEgBRNywQzNxUMSzeThOiDf2NLOu2AGV4OXaZBG4yQhR4edZC1p8IAWuzlli3bddmSnjZCZAIPKZA0hj9VdzAK667KZCnd7e18suAvAzKrmrDOCrm6TEzUlnbdx6Jt86ZBKPIuec8rS66q9fui5DcWcXPytdCJ4vZCvzGEi8bM2doCZBPZAZAqBrGnKRQZDZD".trim(); 
const PHONE_ID = "1022576120942370";
const SPREADSHEET_ID = "1Odobo-H043KZKfYdNpeyMADeEa7wb-k-UyLXD1n_sBM";
const VERIFY_TOKEN = "pogiri_gp_2026"; 

// --- 2. అనవసరమైన మెసేజ్‌ల లిస్ట్ ---
const STOP_WORDS = ["OK", "THANKS", "THANK YOU", "GOOD", "SURE", "BYE", "ధన్యవాదాలు", "ఓకే"];
const MAX_FREE_LIMIT = 980; // 1000 లోపు సేఫ్టీ కోసం

// --- 3. గూగుల్ షీట్ నుండి డేటా & కౌంట్ పొందే ఫంక్షన్ ---
async function getVillageData(userInput, senderPhone) {
    try {
        // CSV ద్వారా డేటా తీసుకోవడం
        const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;
        const response = await axios.get(url);
        const rows = response.data.split('\n').map(row => 
            row.split(',').map(cell => cell.replace(/"/g, '').trim())
        );

        const headers = rows[0];
        
        // "Hi" అని పంపితే ఫోన్ నంబర్ తో, లేదంటే అసెస్మెంట్ నంబర్ తో వెతకడం
        let searchKey = userInput;
        if (userInput === "HI" || userInput === "HELLO" || userInput === "నమస్కారం") {
            searchKey = senderPhone.startsWith('91') ? senderPhone.substring(2) : senderPhone;
        }

        const findRow = rows.find(r => 
            r[headers.indexOf("Assessment No")] === searchKey || 
            r[headers.indexOf("Phone")] === searchKey
        );

        if (findRow) {
            const fullAadhar = findRow[headers.indexOf("Aadhar")] || "N/A";
            const maskedAadhar = fullAadhar.length >= 4 ? `XXXX-XXXX-${fullAadhar.slice(-4)}` : "N/A";

            return `📊 *పొగిరి గ్రామ పంచాయతీ - వివరాలు*\n` +
                   `------------------------------------------\n` +
                   `👤 *పేరు:* ${findRow[headers.indexOf("Name")]}\n` +
                   `👨‍💼 *తండ్రి/భర్త:* ${findRow[headers.indexOf("Guardian")]}\n` +
                   `🆔 *ఆధార్:* ${maskedAadhar}\n` +
                   `🆔 *ఫోన్:* ${findRow[headers.indexOf("Phone")]}\n` +
                   `🏠 *భవనం:* ${findRow[headers.indexOf("Building Sq Feet")] గజాల ${findRow[headers.indexOf("Building Type")]} (${findRow[headers.indexOf("Usage")]})\n` +
                   `🏢 *అంతస్తులు:* ${findRow[headers.indexOf("Floors")]}\n` +
                   `📐 *స్థలం:* ${findRow[headers.indexOf("Site Sq Yards")]} గజాలు\n` +
                   `------------------------------------------\n` +
                   `🧭 *సరిహద్దులు (Boundaries):*\n` +
                   `• తూర్పు: ${findRow[headers.indexOf("East")]}\n` +
                   `• పడమర: ${findRow[headers.indexOf("West")]}\n` +
                   `• ఉత్తరం: ${findRow[headers.indexOf("North")]}\n` +
                   `• దక్షిణం: ${findRow[headers.indexOf("South")]}\n` +
                   `------------------------------------------\n` +
                   `💰 *మొత్తం పన్ను: ₹${findRow[headers.indexOf("Total Tax")]}*\n` +
                   `💰 *వసూలు మొత్తం: ₹${findRow[headers.indexOf("Coll Tax")]}*\n` +
                   `------------------------------------------\n` +
                   `🙏 *గ్రామ అభివృద్ధికి సహకరించండి*`;
        }
        return null;
    } catch (error) {
        return "error";
    }
}

// --- 4. వెబ్‌హుక్ హ్యాండ్లింగ్ ---
app.get('/webhook', (req, res) => {
    if (req.query['hub.verify_token'] === VERIFY_TOKEN) {
        res.status(200).send(req.query['hub.challenge']);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', async (req, res) => {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message && message.type === 'text') {
        const from = message.from;
        const userInput = message.text.body.trim().toUpperCase();

        // నియంత్రణ 1: అనవసర మెసేజ్‌లు వదిలేయడం
        if (STOP_WORDS.includes(userInput)) return res.sendStatus(200);

        // డేటా వెతకడం
        const result = await getVillageData(userInput, from);

        let replyText = "";
        if (result === "error") {
            replyText = "⚠️ సర్వర్ బిజీగా ఉంది. దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.";
        } else if (result) {
            replyText = result;
        } else {
            replyText = `🙏 *నమస్కారం! పొగిరి గ్రామ పంచాయతీ*\n\nమీ వివరాల కోసం మీ *అసెస్మెంట్ నంబర్* పంపండి.\nఉదా: *211320000001*`;
        }

        // వాట్సాప్ రిప్లై పంపడం
        try {
            await axios({
                method: "POST",
                url: `https://graph.facebook.com/v22.0/${PHONE_ID}/messages`,
                data: { messaging_product: "whatsapp", to: from, text: { body: replyText } },
                headers: { "Authorization": `Bearer ${TOKEN}`, "Content-Type": "application/json" }
            });
            console.log(`✅ రిప్లై పంపబడింది: ${from}`);
        } catch (err) {
            console.error("❌ ఎర్రర్:", err.response ? err.response.data : err.message);
        }
    }
    res.sendStatus(200);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Pogiri GP Bot is Live!`));

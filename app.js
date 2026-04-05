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

app.post('/webhook', (req, res) => {
    // మెటా నుండి వచ్చే మొత్తం డేటాను ఇక్కడ చూడండి
    console.log("--- New Incoming Webhook Event ---");
    console.log(JSON.stringify(req.body, null, 2)); 

    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message) {
        console.log(`📩 మెసేజ్ టెక్స్ట్: ${message.text?.body}`);
    }
    res.sendStatus(200);
});

// పాత 8080 తీసేసి ఇలా పెట్టండి
const PORT = process.env.PORT || 10000; 
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 బాట్ పోర్ట్ ${PORT} లో రన్ అవుతోంది...`);
});

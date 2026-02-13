console.log("SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing");
console.log("PHONE:", process.env.TWILIO_PHONE_NUMBER);

const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.post('/call-status', (req, res) => {
    console.log("Webhook hit");
    console.log("Body:", req.body);

    res.type('text/xml');
    res.send('<Response></Response>');
});
app.get('/', (req, res) => {
    res.send("Missed Call Rescue is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

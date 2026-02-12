const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.post('/call-status', async (req, res) => {
    const callStatus = req.body.CallStatus;
    const callDuration = parseInt(req.body.CallDuration || 0);
    const fromNumber = req.body.From;

    console.log("Call Status:", callStatus);
    console.log("Call Duration:", callDuration);
    console.log("From:", fromNumber);

    // If very short completed call OR no-answer → treat as missed
    if ((callStatus === 'completed' && callDuration <= 2) || callStatus === 'no-answer') {
        try {
            await client.messages.create({
                body: "Sorry we missed your call. What service do you need?",
                from: process.env.TWILIO_PHONE_NUMBER,
                to: fromNumber
            });

            console.log("Auto-text sent.");
        } catch (err) {
            console.error("SMS error:", err);
        }
    }

    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.send("Missed Call Rescue is running.");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

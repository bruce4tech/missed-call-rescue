const express = require('express');
const twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// ========================================
// CONTRACTOR MAP (MVP)
// TwilioNumber → Contractor Profile
// ========================================

const contractors = {
    "+18664321841": {
        name: "Jose",
        company: "DJ Skills Contracting",
        phone: "+13216843019",
        autoMessage: "Hi, this is Jose with Skills Contracting. Sorry I missed your call. Let me know what you need and I’ll call you back as soon as I can."
    },
    "+1YOUR_TWILIO_NUMBER_2": {
        name: "John",
        company: "John's Roofing",
        phone: "+1CONTRACTOR_CELL_2",
        autoMessage: "Hey, this is John with John's Roofing. Sorry I missed your call. Are you looking for a new roof or patching a hole?"
    }
};

// ========================================
// MISSED CALL HANDLER
// ========================================

app.post('/call-status', async (req, res) => {

    const callStatus = req.body.CallStatus;
    const fromNumber = req.body.From;
    const twilioNumber = req.body.To;

    console.log("Call Status:", callStatus);
    console.log("From:", fromNumber);
    console.log("To (Twilio Number):", twilioNumber);

    const contractor = contractors[twilioNumber];

    if (!contractor) {
        console.log("No contractor found for number:", twilioNumber);
        return res.type('text/xml').send('<Response></Response>');
    }

    // Only trigger on true missed call
    if (callStatus === 'no-answer') {
        try {
            await client.messages.create({
                body: contractor.autoMessage,
                from: twilioNumber,
                to: fromNumber
            });

            console.log("Auto-text sent for:", contractor.company);
        } catch (err) {
            console.error("SMS error:", err.message);
        }
    }

    res.type('text/xml');
    res.send('<Response></Response>');
});

// ========================================
// INBOUND SMS REPLY HANDLER
// ========================================

app.post('/sms-reply', async (req, res) => {

    const fromNumber = req.body.From;
    const messageBody = req.body.Body;
    const twilioNumber = req.body.To;

    console.log("Incoming SMS from:", fromNumber);
    console.log("Message:", messageBody);
    console.log("To (Twilio Number):", twilioNumber);

    const contractor = contractors[twilioNumber];

    if (!contractor) {
        console.log("No contractor found for number:", twilioNumber);
        return res.sendStatus(200);
    }

    try {
        await client.messages.create({
            body: `New lead for ${contractor.company} from ${fromNumber}: "${messageBody}"`,
            from: twilioNumber,
            to: contractor.phone
        });

        console.log("Forwarded to contractor:", contractor.company);
    } catch (err) {
        console.error("Forward error:", err.message);
    }

    res.sendStatus(200);
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/', (req, res) => {
    res.send("Missed Call Rescue is running.");
});

const PORT = process.env.PORT;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});

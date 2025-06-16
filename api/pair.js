const express = require('express');
const { Boom } = require('@hapi/boom');
const {
    makeWASocket,
    useMongoDBAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const { MongoClient } = require('mongodb');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://your-user:your-password@cluster.mongodb.net/sessionDB';
const client = new MongoClient(MONGO_URI);
let db;

(async () => {
    await client.connect();
    db = client.db('sessionDB');
    console.log('✅ Connected to MongoDB');
})();

// In-memory storage of sessions
const sessions = {};

app.post('/pair', async (req, res) => {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number required' });

    const sessionId = `gifteddave~${uuidv4()}`;
    const sessionCollection = db.collection('sessions');
    const sessionData = { _id: sessionId, phoneNumber, status: 'pending' };
    await sessionCollection.insertOne(sessionData);

    // Initialize Baileys session
    const { state, saveCreds } = await useMongoDBAuthState(sessionCollection, { id: sessionId });
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: state,
        defaultQueryTimeoutMs: undefined
    });

    sessions[sessionId] = sock;

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('⛔ Connection closed. Reconnect:', shouldReconnect);
            if (shouldReconnect) makeWASocket();
        } else if (connection === 'open') {
            sessionCollection.updateOne({ _id: sessionId }, { $set: { status: 'connected' } });
            console.log('✅ Connected:', sessionId);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    res.status(200).json({ sessionId });
});

app.get('/', (req, res) => {
    res.send('✅ Dave-Md-V1 Pairing Backend is Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

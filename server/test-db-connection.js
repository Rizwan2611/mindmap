const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindlink';

console.log('Testing MongoDB connection...');
console.log('URI:', MONGO_URI.replace(/:([^:@]{1,})@/, ':****@'));

mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4,
})
    .then(async (conn) => {
        console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
        // Optional: List collections to be sure
        try {
            const collections = await conn.connection.db.listCollections().toArray();
            console.log('Collections:', collections.map(c => c.name));
        } catch (e) {
            console.log('Could not list collections, but connection is established.');
        }
        process.exit(0);
    })
    .catch((err) => {
        console.error(`❌ Connection Failed: ${err.message}`);
        process.exit(1);
    });

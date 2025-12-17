
const mongoose = require('mongoose');

// Speculative check: Cluster0
const URI = "mongodb+srv://2024rizwans_db_user:RizwanMindMap2025@cluster0.58flrrx.mongodb.net/mindlink?retryWrites=true&w=majority";

console.log("Testing connection to Cluster0:", URI);

mongoose.connect(URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4
})
    .then(() => {
        console.log("SUCCESS: Connected to Cluster0!");
        process.exit(0);
    })
    .catch(err => {
        console.error("FAILURE: Could not connect to Cluster0.");
        console.error(err);
        process.exit(1);
    });

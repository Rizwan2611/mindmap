const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const mapRoutes = require('./routes/maps');
app.use('/api/maps', mapRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindlink';
console.log('Attempting to connect to MongoDB at:', MONGO_URI.replace(/:([^:@]{1,})@/, ':****@')); // MongoDB Connection Strategy
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mindlink', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(`Error: ${err.message}`);
    if (err.message.includes('Authentication failed')) {
      console.error('CRITICAL ERROR: Invalid username or password in MONGODB_URI. Please verify your Render Environment Variables.');
    }
    process.exit(1); // Exit process with failure to trigger restart
  }
};

// ... socket and routes setup remains above ...

// Call the connection function to start the app
connectDB();

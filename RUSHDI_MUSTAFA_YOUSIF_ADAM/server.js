require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const User = require('./models/User');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many registrations, try again later." }
});
app.use('/api/', limiter);

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => {
        console.error("❌ DB Connection Error:", err.message);
        process.exit(1);
    });

// Registration Route
app.post('/api/register', async (req, res, next) => {
    console.log("--- Request Received ---"); // DEBUG LOG
    try {
        const newUser = new User(req.body);
        const savedUser = await newUser.save();
        console.log("--- User Saved Successfully ---"); // DEBUG LOG
        
        res.status(201).json({ 
            success: true,
            message: "Beneficiary registered successfully"
        });
    } catch (error) {
        console.log("--- Error Caught, Passing to Next ---"); // DEBUG LOG
        next(error); 
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Caught in Global Handler:", err.message);
    
    if (err.name === 'ValidationError') {
        return res.status(400).json({ error: "Validation failed", details: err.message });
    }

    res.status(err.status || 500).json({ 
        error: err.message || "An unexpected server error occurred" 
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

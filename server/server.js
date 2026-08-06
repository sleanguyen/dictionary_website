const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const wordRoutes = require('./api/routes/wordRoutes');
const authRoutes = require('./api/routes/authRoutes')
const userRoutes = require('./api/routes/userRoutes')
const app = express();
const PORT = 3000;

const MONGO_URI = 'mongodb+srv://seojax2:xmEPcQmNPRFrRaKy@cluster0.tyr4v68.mongodb.net/polyglot_dictionary?appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/words', wordRoutes);
app.use('/auth', authRoutes); 
app.use('/api/user', userRoutes);

// test route
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: "successfully connected! Backend Express is running." 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
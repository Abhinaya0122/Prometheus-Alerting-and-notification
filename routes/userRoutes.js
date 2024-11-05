// backend/routes/userRoutes.js (Create a new file for user-related routes)
const express = require('express');
const Event = require('../models/Event');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.get('/registered', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const events = await Event.find({ participants: userId });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registered events', error: error.message });
    }
});

module.exports = router;

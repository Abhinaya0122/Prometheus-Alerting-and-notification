// backend/routes/registrationRoutes.js

const express = require('express');
const Registration = require('../models/Registration');
const { verifyToken } = require('../middleware/auth'); // Ensure the user is authenticated
const mongoose = require('mongoose'); // Import mongoose
const Event = require('../models/Event');


const router = express.Router();

// Register for an event
router.post('/', verifyToken, async (req, res) => {
    const { eventId } = req.body;
    console.log(eventId);
    try {
        const registration = new Registration({
            userId: req.user.userId, // Use the user ID from the token
            eventId,
        });
        await registration.save();
        res.status(201).json({ message: 'Registered for event successfully', registration });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event', error: error.message });
    }
});

// Get all registrations for a user
router.get('/', verifyToken, async (req, res) => {
    try {
        const registrations = await Registration.find({ userId: req.user.userId }).populate('eventId'); // Populate event details
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registrations', error: error.message });
    }
});

// backend/routes/registrationRoutes.js

router.get('/my-registrations', verifyToken, async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.user.userId); // Access userId safely
        console.log(userId);
        if (!userId) {
            return res.status(400).json({ message: 'User ID not found in token' });
        }

        const registrations = await Event.find({ participants: userId }); // Query events where userId is in participants
        console.log(registrations);
        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registrations', error: error.message });
    }
});



module.exports = router;

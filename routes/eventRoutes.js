// backend/routes/eventRoutes.js
const express = require('express');
const Event = require('../models/Event'); // Assume you have an Event model
const { verifyToken, isAdmin } = require('../middleware/auth'); // Middleware to check token and role
const mongoose = require('mongoose'); // Import mongoose

const router = express.Router();

// Create new event
router.post('/', verifyToken, isAdmin, async (req, res) => {
    console.log("Request to create event received:", req.body); // Log request data for debugging
    try {
        const newEvent = await Event.create(req.body);
        console.log("Event created successfully:", newEvent); // Log created event for confirmation
        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error creating event:", error.message); // Log error details
        res.status(500).json({ message: 'Failed to create event', error: error.message });
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
    }
});

// Add this route to handle user registration for events
router.post('/:eventId/register', verifyToken, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.userId; 
        console.log(req.user);
        console.log(eventId);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.participants) {
            event.participants = [];
        }

        if (event.participants.includes(userId)) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        event.participants.push(userId); // Add user to participants
        await event.save();

        res.status(200).json({ message: 'Successfully registered for the event' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event', error: error.message });
    }
});
// backend/routes/eventRoutes.js
router.delete('/:eventId', verifyToken, isAdmin, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        await Event.findByIdAndDelete(eventId);
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
    }
});




// Implement update and delete functionalities as needed...

module.exports = router;

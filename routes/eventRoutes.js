// backend/routes/eventRoutes.js
const express = require('express');
const Event = require('../models/Event'); // Assume you have an Event model
const { verifyToken, isAdmin } = require('../middleware/auth'); // Middleware to check token and role

const router = express.Router();

// Create new event
router.post('/', verifyToken, isAdmin, async (req, res) => {
    const { title, description, date } = req.body;
    const newEvent = new Event({ title, description, date });
    try {
        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
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

// backend/routes/eventRoutes.js
// Add this route to handle user registration for events
router.post('/:eventId/register', verifyToken, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.id; // User ID from the token

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.participants) {
            event.participants = [];
        }

        // Check if user is already registered
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

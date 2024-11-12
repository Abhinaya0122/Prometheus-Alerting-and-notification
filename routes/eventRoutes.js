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

router.get('/:eventId/getParticipants', async (req, res) => {
    try {
        // Fetch the event and populate the participants' details (username, RollNo)
        const event = await Event.findById(req.params.eventId).populate('participants', 'username RollNo');
        
        // Check if the event exists
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Map the participants into a list of objects containing both username and RollNo
        const participants = event.participants.map(participant => ({
            username: participant.username,
            RollNo: participant.RollNo
        }));

        // Respond with the list of participants
        res.json({ participants });
    } catch (error) {
        console.error('Error fetching participants:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/:eventId/register', verifyToken, async (req, res) => {
    try {
        const eventId = req.params.eventId; 
        const userId = req.user.userId; 

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.log('Invalid user ID');
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        console.log("User ID:", userId);
        console.log("Event ID:", eventId);

        const event = await Event.findById(eventId);
        if (!event) {
            console.log('Event not found');
            return res.status(404).json({ message: 'Event not found' });
        }

        const conflictingEvent = await Event.findOne({
            date: event.date, 
            participants: { $in: [userId] } 
        });

        if (conflictingEvent && conflictingEvent._id.toString() !== eventId) {
            console.log('User already registered for another event on this date');
            return res.status(400).json({ message: 'You are already registered for another event on this date.' });
        }

        if (event.participants.includes(userId)) {
            console.log('User already registered for this event');
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        event.participants.push(userId); 
        await event.save();

        console.log('Registration successful');
        res.status(200).json({ message: 'Successfully registered for the event' });
    } catch (error) {
        console.error('Error registering for event:', error);
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

// backend/routes/eventRoutes.js
router.put('/:eventId', verifyToken, isAdmin, async (req, res) => {
    const { eventId } = req.params;
    const { title, description, date } = req.body;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Update the event with the new data
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;

        await event.save();
        res.status(200).json(event); // Return the updated event
    } catch (error) {
        console.error('Error updating event:', error.message);
        res.status(500).json({ message: 'Failed to update event', error: error.message });
    }
});

// Cancel registration for a particular event
router.post('/:eventId/cancel', verifyToken, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.user.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Find the event and check if the user is registered for it
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.participants.includes(userId)) {
            return res.status(400).json({ message: 'You are not registered for this event' });
        }

        // Remove the user from the participants list
        event.participants = event.participants.filter(participant => participant.toString() !== userId);
        await event.save();

        res.status(200).json({ message: 'Successfully cancelled registration for the event' });
    } catch (error) {
        console.error('Error cancelling registration:', error.message);
        res.status(500).json({ message: 'Error cancelling registration', error: error.message });
    }
});


// Implement update and delete functionalities as needed...

module.exports = router;

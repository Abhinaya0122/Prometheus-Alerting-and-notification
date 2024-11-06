const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]  // Add participants array
}, { collection: 'events' });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

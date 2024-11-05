// backend/models/Registration.js

const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
}, { collection: 'registrations' });

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration;

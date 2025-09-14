const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    role: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const MessageSchema = new mongoose.Schema({
    interview_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview', required: true },
    messages: [ChatSchema]
});

module.exports = mongoose.model('Message', MessageSchema);
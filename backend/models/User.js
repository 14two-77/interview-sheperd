const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
    scores: [{ title: String, score: Number }],
    suggestions: String
}, { _id: false });

const InterviewSchema = new mongoose.Schema({
    title: String,
    description: String,
    language: String,
    resume: String,
    results: ResultSchema
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    interviews: [InterviewSchema]
});

module.exports = mongoose.model('Users', UserSchema);

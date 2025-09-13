const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
}, { timestamps: true });

module.exports = mongoose.model('Scenarios', ScenarioSchema);

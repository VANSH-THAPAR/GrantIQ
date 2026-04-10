const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    url: { type: String, required: true },
    title: { type: String },
    status: { type: String, enum: ['pending', 'success', 'failed', 'captcha_required', 'user_input_required'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Form', formSchema);

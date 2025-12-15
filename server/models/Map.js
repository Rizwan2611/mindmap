const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
    id: String,
    type: String, // 'text', 'image', etc.
    content: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    style: Object,
});

const edgeSchema = new mongoose.Schema({
    id: String,
    source: String,
    target: String,
});

const mapSchema = new mongoose.Schema({
    title: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nodes: [nodeSchema],
    edges: [edgeSchema],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('Map', mapSchema);

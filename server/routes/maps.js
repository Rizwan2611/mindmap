const express = require('express');
const router = express.Router();
const Map = require('../models/Map');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

router.get('/', verifyToken, async (req, res) => {
    try {
        // Find maps where user is owner OR collaborator
        const maps = await Map.find({
            $or: [
                { owner: req.userId },
                { collaborators: req.userId }
            ]
        });
        res.json(maps);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', verifyToken, async (req, res) => {
    try {
        const map = new Map({
            title: req.body.title || 'Untitled Map',
            owner: req.userId,
            nodes: req.body.nodes || [],
            edges: req.body.edges || []
        });
        await map.save();
        res.status(201).json(map);
    } catch (error) {
        console.error('Error creating map:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const map = await Map.findById(req.params.id);
        if (!map) return res.status(404).json({ error: 'Map not found' });

        // Access Control
        // Access Control (Relaxed for easier collaboration - Link Sharing Mode)
        // If you want strict private maps, uncomment the lines below:
        /*
        if (map.owner.toString() !== req.userId && !map.collaborators.includes(req.userId)) {
            return res.status(403).json({ error: 'Access denied. You are not a collaborator on this map.' });
        }
        */

        // Auto-add visitor as collaborator so they show up in dashboards? 
        // For now, just allow access.

        res.json(map);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Invite Collaborator Route
router.post('/:id/invite', verifyToken, async (req, res) => {
    try {
        const { email } = req.body;
        const map = await Map.findById(req.params.id);
        if (!map) return res.status(404).json({ error: 'Map not found' });

        // Only owner can invite? Or existing collaborators too? Let's say owner for now.
        if (map.owner.toString() !== req.userId) {
            return res.status(403).json({ error: 'Only the owner can invite collaborators.' });
        }

        const userToInvite = await User.findOne({ email: email.toLowerCase().trim() });
        if (!userToInvite) {
            return res.status(404).json({ error: 'User not found. They must be registered on MindLink to be invited.' });
        }

        if (map.collaborators.includes(userToInvite._id)) {
            return res.status(400).json({ error: 'User is already a collaborator.' });
        }

        if (map.owner.toString() === userToInvite._id.toString()) {
            return res.status(400).json({ error: 'You are the owner of this map.' });
        }

        map.collaborators.push(userToInvite._id);
        await map.save();

        res.json({ message: 'Collaborator added successfully', user: { username: userToInvite.username, email: userToInvite.email } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { title, nodes, edges } = req.body;

        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (nodes !== undefined) updateData.nodes = nodes;
        if (edges !== undefined) updateData.edges = edges;

        const map = await Map.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!map) return res.status(404).json({ error: 'Map not found' });
        res.json(map);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const map = await Map.findByIdAndDelete(req.params.id);
        if (!map) return res.status(404).json({ error: 'Map not found' });
        res.json({ message: 'Map deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

// server/routes/subscriberRoutes.js
const express = require('express');
const Subscriber = require('../models/Subscriber');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/subscribers - Public newsletter subscribe + notify admin in real time
router.post('/', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalizedEmail = email.toLowerCase().trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    const existing = await Subscriber.findOne({ email: normalizedEmail });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'This email is already subscribed.' });
    }

    const subscriber = await Subscriber.create({
      email: normalizedEmail,
      name: name || '',
    });

    const io = req.app.get('io');
    if (io) {
      io.to('admins').emit('new_subscriber', {
        _id: subscriber._id,
        email: subscriber.email,
        createdAt: subscriber.createdAt,
      });
    }

    res.status(201).json({ message: 'Subscribed successfully!', subscriber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/subscribers - Admin: list all subscriber emails
router.get('/', protect, authorizeAdmin, async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json({ subscribers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

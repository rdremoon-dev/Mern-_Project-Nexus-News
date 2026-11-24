const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendVerificationEmail } = require('../utils/sendVerificationEmail');

const router = express.Router();

const signToken = user =>
  jwt.sign(
    { id: user._id, role: user.role, isVerified: user.isVerified },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );

const getFrontendUrl = req => {
  const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(origin => origin.trim().replace(/\/+$/, ''))
    .filter(origin => /^https?:\/\//i.test(origin));

  const requestOrigin = req.get('origin')?.trim().replace(/\/+$/, '');

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  const fallbackUrl = (process.env.FRONTEND_URL || '')
    .split(',')[0]
    ?.trim()
    .replace(/\/+$/, '');

  if (fallbackUrl && /^https?:\/\//i.test(fallbackUrl)) {
    return fallbackUrl;
  }

  return allowedOrigins[0] || 'http://localhost:5173';
};

// POST /api/auth/register - Register normal verifiable user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'An account with this email already exists.' });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'user',
      isVerified: false,
    });

    const rawToken = user.createVerificationToken();
    await user.save();

    const verifyUrl = `${getFrontendUrl(req)}/verify-email?token=${rawToken}`;

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verifyUrl,
      });
    } catch (mailError) {
      console.error('Verification email error:', mailError);
      // Remove unverified user if email delivery fails so they can retry cleanly
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        message:
          'Could not send verification email. Please check your email address and try again.',
      });
    }

    res.status(201).json({
      message: `Verification email sent to ${user.email}. Please check your inbox (and spam folder) to verify your account.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/resend-verification - Resend verification link
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res
        .status(404)
        .json({ message: 'No account found with that email.' });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: 'This email is already verified. You can log in now.',
      });
    }

    const previousToken = user.verificationToken;
    const previousExpires = user.verificationTokenExpires;
    const rawToken = user.createVerificationToken();
    await user.save();

    const verifyUrl = `${getFrontendUrl(req)}/verify-email?token=${rawToken}`;

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        verifyUrl,
      });
    } catch (mailError) {
      console.error('Resend verification email error:', mailError);
      user.verificationToken = previousToken;
      user.verificationTokenExpires = previousExpires;
      await user.save();
      return res.status(502).json({
        message:
          'Could not send a new verification email right now. Please try again shortly.',
      });
    }

    res.json({
      message: `A new verification link has been sent to ${user.email}.`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/verify/:token - Verify user account
router.get('/verify/:token', async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Invalid or expired verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({
      message: 'Account verified successfully! You can now log in.',
      token: signToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login - User & Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          'Your account is not verified yet. Please verify your email first.',
        needsVerification: true,
      });
    }

    if (expectedRole && user.role !== expectedRole) {
      return res.status(403).json({
        message: `Access denied for ${expectedRole} portal. Your account role is "${user.role}".`,
      });
    }

    res.json({
      token: signToken(user),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        bookmarks: user.bookmarks || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/auth/me - Current authenticated user profile + saved posts
router.get('/me', protect, async (req, res) => {
  try {
    const populated = await User.findById(req.user._id)
      .select('-password')
      .populate('bookmarks', 'title slug category coverImage createdAt');
    res.json({ user: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/bookmarks/:blogId - Toggle saved post in User Dashboard
router.post('/bookmarks/:blogId', protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.blogId)) {
      return res.status(400).json({ message: 'Invalid blog ID' });
    }

    const user = await User.findById(req.user._id);
    const exists = user.bookmarks.some(
      id => id.toString() === req.params.blogId,
    );

    if (exists) {
      user.bookmarks = user.bookmarks.filter(
        id => id.toString() !== req.params.blogId,
      );
    } else {
      user.bookmarks.push(req.params.blogId);
    }

    await user.save();
    res.json({ bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

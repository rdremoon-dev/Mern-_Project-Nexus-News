const express = require('express');
const ImageKit = require('imagekit');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const getImageKitInstance = () =>
  new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });

// GET /api/imagekit/auth - Admin signed upload credentials
router.get('/auth', protect, authorizeAdmin, (req, res) => {
  try {
    if (
      !process.env.IMAGEKIT_PUBLIC_KEY ||
      !process.env.IMAGEKIT_PRIVATE_KEY ||
      !process.env.IMAGEKIT_URL_ENDPOINT
    ) {
      return res.status(503).json({
        message: 'Image uploads are not configured on the server.',
      });
    }
    const imagekit = getImageKitInstance();
    const authParams = imagekit.getAuthenticationParameters();
    res.json({
      ...authParams,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

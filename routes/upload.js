const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stayfinder/profile-photos',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

const upload = multer({ storage });

// verifyToken runs FIRST, so only logged-in users can upload.
// We use req.userId from the token, not a userId sent by the frontend.
router.post('/profile-photo', verifyToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // multer-storage-cloudinary puts the final, permanent Cloudinary URL here
  const fileUrl = req.file.path;

  try {
    const user = await User.findByIdAndUpdate(req.userId, { photo: fileUrl }, { new: true })
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ url: fileUrl, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving photo to user' });
  }
});

router.delete('/profile-photo', verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, { photo: '' }, { new: true })
      .select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error deleting profile photo' });
  }
});
module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const User = require('../models/User'); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/profile-photos';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, JPG allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

router.post('/profile-photo', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `/uploads/profile-photos/${req.file.filename}`;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  try {
    
    const user = await User.findByIdAndUpdate(userId, { photoUrl: fileUrl }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ url: fileUrl, user }); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error saving photo to user' });
  }
});

module.exports = router;

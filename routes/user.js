const express = require('express');
const router = express.Router();
const User = require('../models/User');
const verifyToken = require('../middleware/auth');

// A logged-in user can only read or change their OWN profile.
// req.userId comes from the verified JWT, so it can't be faked.
const onlySelf = (req, res, next) => {
  if (req.params.id !== String(req.userId)) {
    return res.status(403).json({ error: 'You can only access your own profile' });
  }
  next();
};

router.get('/:id', verifyToken, onlySelf, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', verifyToken, onlySelf, async (req, res) => {
  try {
    // Only allow safe fields to be updated (not email or password)
    const updates = {};
    if (typeof req.body.name === 'string' && req.body.name.trim()) {
      updates.name = req.body.name.trim();
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('-password');
    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
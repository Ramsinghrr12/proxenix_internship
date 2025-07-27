const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer setup for chat images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};
const upload = multer({ storage, fileFilter });

// Get all chats for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'fullName email profilePic')
      .sort({ updatedAt: -1 });
    res.json(chats.map(chat => ({
      _id: chat._id,
      participants: chat.participants,
      lastMessage: chat.messages[chat.messages.length - 1] || null,
      updatedAt: chat.updatedAt
    })));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages for a specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants', 'fullName email profilePic');
    if (!chat || !chat.participants.some(p => p._id.equals(req.userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json(chat.messages);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message to a user (creates chat if not exists)
router.post('/:userId/message', auth, async (req, res) => {
  const { content } = req.body;
  const otherUserId = req.params.userId;
  if (!content) return res.status(400).json({ error: 'Message content required' });
  if (otherUserId === req.userId) return res.status(400).json({ error: 'Cannot message yourself' });
  try {
    // Check if users are contacts
    const user = await User.findById(req.userId);
    if (!user.contacts.includes(otherUserId)) {
      return res.status(403).json({ error: 'User is not in your contacts' });
    }
    // Find or create chat
    let chat = await Chat.findOne({
      participants: { $all: [req.userId, otherUserId], $size: 2 }
    });
    if (!chat) {
      chat = new Chat({ participants: [req.userId, otherUserId], messages: [] });
    }
    chat.messages.push({ sender: req.userId, content });
    chat.updatedAt = new Date();
    await chat.save();
    res.json({ success: true, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Image upload endpoint
router.post('/:chatId/image', auth, upload.single('image'), async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat || !chat.participants.some(p => p.equals(req.userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    const imageUrl = `uploads/${req.file.filename}`;
    const message = {
      sender: req.userId,
      imageUrl,
      timestamp: new Date()
    };
    chat.messages.push(message);
    chat.updatedAt = new Date();
    await chat.save();
    res.json({ success: true, message });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const User = require('../models/User');
const router = express.Router();
const mongoose = require('mongoose');
const Request = require('../models/Request');
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');

// Multer setup for profile picture upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Signup route
router.post('/signup', upload.single('profilePic'), async (req, res) => {
  try {
    const { fullName, number, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const profilePic = req.file ? req.file.path : '';
    const user = new User({
      fullName,
      number,
      email,
      password: hashedPassword,
      profilePic,
    });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug log
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, number: user.number, profilePic: user.profilePic } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get available users to send requests to
router.get('/available-users', auth, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    // Get all users who are not in contacts, not self, and do not have a pending/accepted request between them
    const sentRequests = await Request.find({ from: req.userId }).select('to status');
    const receivedRequests = await Request.find({ to: req.userId }).select('from status');
    const sentToIds = sentRequests.filter(r => r.status !== 'Declined').map(r => r.to.toString());
    const receivedFromIds = receivedRequests.filter(r => r.status !== 'Declined').map(r => r.from.toString());
    const excludeIds = [
      req.userId,
      ...currentUser.contacts.map(id => id.toString()),
      ...sentToIds,
      ...receivedFromIds,
    ];
    const users = await User.find({ _id: { $nin: excludeIds } }, 'fullName profilePic');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Send a request
router.post('/send-request', auth, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'No target user' });
    if (req.userId === targetUserId) return res.status(400).json({ message: 'Cannot send request to self' });
    // Check if request already exists
    const existing = await Request.findOne({ from: req.userId, to: targetUserId });
    if (existing) return res.status(400).json({ message: 'Request already sent' });
    // Check if already contacts
    const currentUser = await User.findById(req.userId);
    if (currentUser.contacts.includes(targetUserId)) return res.status(400).json({ message: 'Already in contacts' });
    // Create request
    await Request.create({ from: req.userId, to: targetUserId });
    res.json({ message: 'Request sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get sent requests with profile info
router.get('/sent-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ from: req.userId })
      .populate('to', 'fullName profilePic')
      .sort('-createdAt');
    res.json(requests.map(r => ({
      _id: r._id,
      user: r.to,
      status: r.status,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get received requests with profile info
router.get('/received-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({ to: req.userId })
      .populate('from', 'fullName profilePic')
      .sort('-createdAt');
    res.json(requests.map(r => ({
      _id: r._id,
      user: r.from,
      status: r.status,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Accept a request
router.post('/accept-request', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await Request.findById(requestId);
    if (!request || request.to.toString() !== req.userId) return res.status(404).json({ message: 'Request not found' });
    request.status = 'Accepted';
    await request.save();
    // Add each other to contacts if not already
    const userA = await User.findById(request.from);
    const userB = await User.findById(request.to);
    if (!userA.contacts.includes(request.to)) userA.contacts.push(request.to);
    if (!userB.contacts.includes(request.from)) userB.contacts.push(request.from);
    await userA.save();
    await userB.save();
    // Auto-create chat if not exists
    const existingChat = await Chat.findOne({
      participants: { $all: [request.from, request.to], $size: 2 }
    });
    if (!existingChat) {
      await Chat.create({ participants: [request.from, request.to], messages: [] });
    }
    res.json({ message: 'Request accepted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Decline a request
router.post('/decline-request', auth, async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await Request.findById(requestId);
    if (!request || request.to.toString() !== req.userId) return res.status(404).json({ message: 'Request not found' });
    request.status = 'Declined';
    await request.save();
    res.json({ message: 'Request declined' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 
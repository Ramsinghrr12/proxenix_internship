const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: 'https://chatapplication-1-ezk6.onrender.com',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);

// Placeholder for routes
app.get('/', (req, res) => {
  res.send('API is running');
});

// Connect to MongoDB
console.log('MONGO_URI:', process.env.MONGODB_URI);
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  // Join a chat room
  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
  });

  // Leave a chat room
  socket.on('leaveChat', (chatId) => {
    socket.leave(chatId);
  });

  // Relay message to all users in the chat room
  socket.on('sendMessage', ({ chatId, message }) => {
    io.to(chatId).emit('receiveMessage', message);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 

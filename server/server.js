const dns = require('node:dns');

// DNS configuration
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

const http = require('http');
const path = require('node:path');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

require('dotenv').config({
  path: path.resolve(__dirname, '.env'),
});

const User = require('./models/User.js');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const blogRoutes = require('./routes/blogRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const imagekitRoutes = require('./routes/imagekitRoutes');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Allowed frontend origins
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

// Express CORS configuration
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Make Socket.IO accessible inside Express routes
app.set('io', io);

// ==========================================
// SOCKET.IO AUTHENTICATION MIDDLEWARE
// ==========================================

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    // Allow anonymous visitors to receive public notifications
    if (!token) {
      socket.user = null;
      return next();
    }

    if (!process.env.JWT_SECRET) {
      return next(new Error('Server authentication is not configured'));
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.id) {
      return next(new Error('Invalid token payload'));
    }

    // Verify that the user still exists and is verified
    const user = await User.findById(decoded.id).select('_id role isVerified');

    if (!user || !user.isVerified) {
      return next(new Error('Unauthorized user'));
    }

    // Attach authenticated user to socket
    socket.user = user;

    next();
  } catch (error) {
    console.error('Socket authentication error:', error.message);
    next(new Error('Invalid authentication token'));
  }
});

// ==========================================
// SOCKET.IO CONNECTION HANDLER
// ==========================================

io.on('connection', socket => {
  console.log('Socket connected:', socket.id);

  // Every connected visitor can receive public notifications
  socket.join('public');

  // Authenticated user room
  if (socket.user) {
    socket.join(`user:${socket.user._id}`);

    // Only verified admin users enter the admin room
    if (socket.user.role === 'admin') {
      socket.join('admins');
      console.log(`Admin connected: ${socket.user._id}`);
    }
  }

  socket.on('disconnect', reason => {
    console.log('Socket disconnected:', socket.id, reason);
  });
});

// ==========================================
// API ROUTES
// ==========================================

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/imagekit', imagekitRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Nexus News Real-Time MERN API is running...',
  });
});

// ==========================================
// SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Socket.IO is ready');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

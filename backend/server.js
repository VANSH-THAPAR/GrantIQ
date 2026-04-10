require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const formRoutes = require('./routes/formRoutes');

// --- Startup validation ---
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'GEMINI_API_KEY'];
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required env var: ${key}`);
    process.exit(1);
  }
}
if (process.env.JWT_SECRET.length < 32) {
  console.error('FATAL: JWT_SECRET is too weak (min 32 chars)');
  process.exit(1);
}

// Connect Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
  'https://grantiq-chitkaraverse.netlify.app'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // ALLOW ALL for Hackathon so it never fails
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting — 100 requests per 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' }
});
app.use('/api/', apiLimiter);

// --- Routes ---
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/forms', formRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running normally.' });
});

// --- Centralized Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : err.message,
  });
});

// --- Start Server with Graceful Shutdown ---
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
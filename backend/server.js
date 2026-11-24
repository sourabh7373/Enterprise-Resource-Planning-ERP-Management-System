const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config/env');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));

// Serve uploaded files statically (restricted or authenticated if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date() });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Centralized Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
}

module.exports = app;

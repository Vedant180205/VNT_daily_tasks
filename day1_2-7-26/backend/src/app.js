const express = require('express');
const statusRoutes = require('./routes/status.routes');

const app = express();

// Middleware
app.use(express.json());

// Routes – prefix all status routes with /api/internal
app.use('/api/internal', statusRoutes);

module.exports = app;
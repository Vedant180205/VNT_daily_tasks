const express = require("express");
const logger = require("./middleware/logger");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();
const playerRoutes = require("./routes/playerRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");


const app = express();



// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", limiter);

// Enable CORS
app.use(cors());

// Parse JSON request body
app.use(express.json());

// Logger middleware
app.use(logger);

// Health Check Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Player Management API is running"
    });
});

// Routes
app.use("/api/players", playerRoutes);

// 404 Handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
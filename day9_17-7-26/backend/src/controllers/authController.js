const authService = require("../services/authService");

// Responsible for handling the registration request, calling the service, and sending the appropriate HTTP response
const register = async (req, res, next) => {
    try {
        const userData = req.body;
        
        // Delegate to service for business logic
        const user = await authService.registerUser(userData);

        // Success response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
};

// Handles user login request, delegates to service, and formats the response
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        // Delegate to service for authentication
        const result = await authService.loginUser(email, password);

        // Success response
        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            data: result.user
        });
    } catch (error) {
        next(error);
    }
};

// Handles fetching the authenticated user's profile
const getMe = async (req, res, next) => {
    try {
        const userId = req.user.id;
        
        // Delegate to service to retrieve fresh data from DB
        const user = await authService.getUserProfile(userId);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

const signupOrganizer = async (req, res, next) => {
    try {
        const organizerData = {
            ...req.body,
            documents: req.files ? req.files['documents'] : []
        };
        
        // Delegate to service
        const result = await authService.signupOrganizer(organizerData);

        res.status(201).json({
            success: true,
            message: "Signup submitted. Awaiting admin approval.",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    getMe,
    signupOrganizer
};

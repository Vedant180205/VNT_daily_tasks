const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const organizerModel = require("../models/organizerModel");

// Responsible for handling Phase 1 Lead Application submission
const submitOrganizerApplication = async (applicationData) => {
    const { email } = applicationData;

    // 1. Check if email already exists in users table (fully registered user)
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    // 2. Check if email already exists in organizers table (pending organizer application)
    const existingOrganizer = await organizerModel.findOrganizerByEmail(email);
    if (existingOrganizer) {
        const error = new Error("Email already pending for approval");
        error.statusCode = 409;
        throw error;
    }

    // 3. Save strictly Phase 1 application details to organizers table
    const organizerId = await organizerModel.createOrganizerApplication(applicationData);

    return { id: organizerId, email };
};

// Responsible for applying business logic during organizer signup (Delegates to submitOrganizerApplication)
const signupOrganizer = async (organizerData) => {
    return await submitOrganizerApplication(organizerData);
};

// Responsible for applying business logic during user registration (validating uniqueness, hashing password)
const registerUser = async (userData) => {
    const { name, email, password } = userData;

    // 1. Check if email already exists
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
    }

    // 2. Hash the password before storing (using 10 salt rounds)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Store the user in the database (ONLY the hashed password)
    const newUserId = await userModel.createUser({
        name,
        email,
        password: hashedPassword
    });

    // 4. Return successful user data, making sure NOT to include the password
    return {
        id: newUserId,
        name,
        email
    };
};

// Responsible for applying business logic during user login (checking credentials, generating JWT)
const loginUser = async (email, password) => {
    // 1. Check if user exists by email
    const user = await userModel.findUserByEmail(email);
    if (!user) {
        // If not in users, check if they are an unapproved organizer
        const organizer = await organizerModel.findOrganizerByEmail(email);
        if (organizer && organizer.approval_status !== 1) {
            const error = new Error("Account not approved yet");
            error.statusCode = 403; // Forbidden
            throw error;
        }

        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // 2. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    // 3. If user is an Organizer, verify that their organizer account is fully activated by Admin
    if (user.role_name === 'Organizer' || user.role_name === 'organizer') {
        const organizer = await organizerModel.findOrganizerByEmail(email);
        if (organizer && (organizer.approval_status !== 5 && organizer.is_active !== 1)) {
            const error = new Error("Your account is not yet activated. Current Status: Documents under verification by Admin.");
            error.statusCode = 403; // Forbidden
            throw error;
        }
    }

    // 4. Generate a JWT payload containing only safe user data
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role_name
    };

    // 4. Sign the token with a 24 hours expiration and the secret from .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // 5. Return token and successful user data (without password)
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role_name
        }
    };
};

// Responsible for retrieving the user's fresh profile details
const getUserProfile = async (id) => {
    const user = await userModel.findUserById(id);
    if (!user) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    // Return safe data only
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name
    };
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile,
    signupOrganizer,
    submitOrganizerApplication
};

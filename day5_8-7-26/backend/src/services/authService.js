const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const roleModel = require("../models/roleModel");

// Responsible for applying business logic during user registration (validating uniqueness, hashing password)
const registerUser = async (userData) => {
    const { name, email, password, role_id } = userData;

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
        password: hashedPassword,
        role_id
    });

    // 4. Return successful user data, making sure NOT to include the password
    return {
        id: newUserId,
        name,
        email,
        role_id
    };
};

// Responsible for applying business logic during user login (checking credentials, generating JWT)
const loginUser = async (email, password) => {
    // 1. Check if user exists by email
    const user = await userModel.findUserByEmail(email);
    if (!user) {
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

    // 3. Generate a JWT payload containing only safe user data
    const payload = {
        id: user.id,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name
    };

    // 4. Sign the token with a 24 hours expiration and the secret from .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Fetch the user's explicit permissions
    const permissions = await roleModel.getPermissionsByRoleId(user.role_id);

    // 5. Return token and successful user data (without password)
    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role_id: user.role_id,
            role_name: user.role_name,
            permissions
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

    // Fetch the user's explicit permissions
    const permissions = await roleModel.getPermissionsByRoleId(user.role_id);

    // Return safe data only
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: user.role_name,
        permissions
    };
};

module.exports = {
    registerUser,
    loginUser,
    getUserProfile
};

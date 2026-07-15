const nameRegex = /^[A-Za-z\s]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\d{10}$/;

const validatePlayerData = (data) => {
    const { name, email, phone } = data;

    // Name Validation
    if (!name) throw { status: 400, message: "Name is required" };
    if (!name.trim()) throw { status: 400, message: "Name cannot be empty" };
    if (!nameRegex.test(name.trim())) throw { status: 400, message: "Name should contain only alphabets and spaces" };

    // Email Validation
    if (!email) throw { status: 400, message: "Email is required" };
    if (!emailRegex.test(email.trim())) throw { status: 400, message: "Invalid email format" };

    // Phone Validation
    if (!phone) throw { status: 400, message: "Phone number is required" };
    if (!phoneRegex.test(phone.trim())) throw { status: 400, message: "Phone number must contain exactly 10 digits" };
    
    return true;
};

module.exports = {
    validatePlayerData
};

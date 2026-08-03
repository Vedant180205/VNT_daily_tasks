require("dotenv").config();
const nodemailer = require("nodemailer");

// Initialize Nodemailer Transport
const createTransporter = () => {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (user && pass) {
        return nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
    }

    // Fallback Transport if SMTP credentials are not yet configured in .env
    return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
            user: "ethereal.user@ethereal.email",
            pass: "ethereal_pass"
        }
    });
};

const emailTemplateModel = require("../models/emailTemplateModel");
const transporter = createTransporter();

// Helper to replace variables in template body
const renderTemplate = (html, variables) => {
    let result = html;
    for (const [key, value] of Object.entries(variables)) {
        // Replace all instances of {{key}} with value
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value || '');
    }
    return result;
};

// Sends secure Phase 2 registration link email
const sendRegistrationLinkEmail = async (toEmail, name, inviteLink, expiresInHours) => {
    const from = process.env.EMAIL_FROM || '"VNT Tournament Admin" <noreply@vntsports.com>';
    
    let subject = "Approved! Complete Your VNT Organizer Registration";
    let htmlContent = `Fallback HTML`; // We'll rely on DB template mostly
    
    try {
        const template = await emailTemplateModel.getTemplateByName('REGISTRATION_LINK');
        if (template) {
            subject = template.subject;
            htmlContent = renderTemplate(template.body_html, { name, inviteLink, expiresInHours });
        }
    } catch (err) {
        console.error("Failed to load email template from DB:", err);
    }

    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("==================================================================");
            console.log(`[EMAIL DISPATCH - SIMULATION LOG] To: ${toEmail}`);
            console.log(`Subject: ${subject}`);
            console.log(`Link: ${inviteLink}`);
            console.log("==================================================================");
            return { messageId: "simulated-id-" + Date.now(), simulated: true };
        }

        const info = await transporter.sendMail({
            from,
            to: toEmail,
            subject,
            html: htmlContent
        });

        console.log(`[EMAIL SENT] MessageId: ${info.messageId} to ${toEmail}`);
        return info;
    } catch (error) {
        console.error("[EMAIL ERROR] Failed to send email via Nodemailer:", error.message);
        return { error: error.message };
    }
};

// Sends rejection notification email
const sendRejectionEmail = async (toEmail, name, reason) => {
    const from = process.env.EMAIL_FROM || '"VNT Tournament Admin" <noreply@vntsports.com>';
    
    let subject = "VNT Organizer Application Update";
    let htmlContent = `Fallback HTML`;

    try {
        const template = await emailTemplateModel.getTemplateByName('REJECTION');
        if (template) {
            subject = template.subject;
            // The DB template handles the reason conditional using {{reason}}
            htmlContent = renderTemplate(template.body_html, { name, reason });
        }
    } catch (err) {
        console.error("Failed to load email template from DB:", err);
    }

    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("==================================================================");
            console.log(`[EMAIL DISPATCH - SIMULATION LOG] To: ${toEmail}`);
            console.log(`Subject: ${subject}`);
            console.log(`Reason: ${reason}`);
            console.log("==================================================================");
            return { messageId: "simulated-id-" + Date.now(), simulated: true };
        }

        const info = await transporter.sendMail({
            from,
            to: toEmail,
            subject,
            html: htmlContent
        });

        console.log(`[EMAIL SENT] Rejection email sent to ${toEmail}`);
        return info;
    } catch (error) {
        console.error("[EMAIL ERROR] Failed to send rejection email:", error.message);
        return { error: error.message };
    }
};

// Sends account activation success email
const sendActivationEmail = async (toEmail, name) => {
    const from = process.env.EMAIL_FROM || '"VNT Tournament Admin" <noreply@vntsports.com>';
    const loginUrl = (process.env.FRONTEND_URL || "http://localhost:5173") + "/login";
    
    let subject = "Congratulations! Your VNT Organizer Account is Activated";
    let htmlContent = `Fallback HTML`;

    try {
        const template = await emailTemplateModel.getTemplateByName('ACTIVATION');
        if (template) {
            subject = template.subject;
            htmlContent = renderTemplate(template.body_html, { name, loginUrl });
        }
    } catch (err) {
        console.error("Failed to load email template from DB:", err);
    }

    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("==================================================================");
            console.log(`[EMAIL DISPATCH - SIMULATION LOG] To: ${toEmail}`);
            console.log(`Subject: ${subject}`);
            console.log(`Login URL: ${loginUrl}`);
            console.log("==================================================================");
            return { messageId: "simulated-id-" + Date.now(), simulated: true };
        }

        const info = await transporter.sendMail({
            from,
            to: toEmail,
            subject,
            html: htmlContent
        });

        console.log(`[EMAIL SENT] Account activation email sent to ${toEmail}`);
        return info;
    } catch (error) {
        console.error("[EMAIL ERROR] Failed to send activation email:", error.message);
        return { error: error.message };
    }
};

module.exports = {
    sendRegistrationLinkEmail,
    sendRejectionEmail,
    sendActivationEmail
};

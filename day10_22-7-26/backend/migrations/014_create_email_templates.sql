CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_name VARCHAR(50) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    available_variables JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO email_templates (template_name, subject, body_html, available_variables) VALUES 
('REGISTRATION_LINK', 'Approved! Complete Your VNT Organizer Registration', '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4F46E5; margin-bottom: 10px;">Application Approved! 🎉</h2>
            <p>Hello <strong>{{name}}</strong>,</p>
            <p>Great news! Your Phase 1 lead application to become a VNT Tournament Organizer has been reviewed and approved by the Admin team.</p>
            
            <p>Please click the button below to complete your Phase 2 registration, password setup, and KYC document upload:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{inviteLink}}" style="background-color: #4F46E5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Complete Organizer Registration
                </a>
            </div>

            <p style="font-size: 12px; color: #6b7280; background-color: #f9fafb; padding: 10px; border-radius: 6px;">
                ⚠️ <strong>Important Security Note:</strong> This registration link will expire in <strong>{{expiresInHours}} hours</strong>. If it expires, please contact the admin for a new link.
            </p>

            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                If the button doesn''t work, copy and paste this link into your browser:<br/>
                <a href="{{inviteLink}}" style="color: #4F46E5;">{{inviteLink}}</a>
            </p>
        </div>
', '["name", "inviteLink", "expiresInHours"]'),

('REJECTION', 'VNT Organizer Application Update', '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #EF4444; margin-bottom: 10px;">Application Update</h2>
            <p>Hello <strong>{{name}}</strong>,</p>
            <p>Thank you for your interest in becoming a VNT Tournament Organizer.</p>
            <p>After reviewing your application, we regret to inform you that your lead application could not be accepted at this time.</p>
            
            <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #991B1B;"><strong>Reason:</strong> {{reason}}</p>
            </div>

            <p style="font-size: 13px; color: #6b7280;">If you believe this was an error or would like to re-apply with updated details, feel free to submit a new enquiry.</p>
        </div>
', '["name", "reason"]'),

('ACTIVATION', 'Congratulations! Your VNT Organizer Account is Activated', '
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #10B981; margin-bottom: 10px;">Account Activated! 🚀</h2>
            <p>Hello <strong>{{name}}</strong>,</p>
            <p>Congratulations! Your KYC documents have been verified and your VNT Tournament Organizer account has been fully activated by the Admin.</p>
            
            <p>You can now log in using your registered email and password to access the Organizer Dashboard and create/manage tournaments:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{{loginUrl}}" style="background-color: #10B981; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Log In to Dashboard
                </a>
            </div>

            <p style="font-size: 12px; color: #6b7280; background-color: #f9fafb; padding: 10px; border-radius: 6px;">
                <strong>Next Steps:</strong> Once logged in, you can set up your organization profile and start creating your first tournament!
            </p>

            <p style="font-size: 12px; color: #9ca3af; margin-top: 20px;">
                If the button doesn''t work, copy and paste this link into your browser:<br/>
                <a href="{{loginUrl}}" style="color: #10B981;">{{loginUrl}}</a>
            </p>
        </div>
', '["name", "loginUrl"]');

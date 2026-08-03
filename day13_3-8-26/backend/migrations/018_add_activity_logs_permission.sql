-- Insert view_activity_logs permission
INSERT IGNORE INTO permissions (id, name, description) VALUES
(12, 'view_activity_logs', 'Permission to view activity and performance logs');

-- Map to Admin (role_id: 1) and Sub Admin (role_id: 2)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(1, 12),
(2, 12);

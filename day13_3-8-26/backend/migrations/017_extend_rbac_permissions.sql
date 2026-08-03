-- Insert new permissions
INSERT IGNORE INTO permissions (id, name, description) VALUES
(7, 'delete_teams', 'Permission to delete teams'),
(8, 'view_enrollments', 'Permission to view enrollments'),
(9, 'manage_notifications', 'Permission to create and delete notifications'),
(10, 'manage_email_templates', 'Permission to view and edit email templates'),
(11, 'manage_organizers', 'Permission to manage organizers lifecycle');

-- Map new permissions to Admin (role_id: 1)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(1, 7),
(1, 8),
(1, 9),
(1, 10),
(1, 11);

-- Map delete_teams to Organizer (role_id: 4)
INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES
(4, 7);

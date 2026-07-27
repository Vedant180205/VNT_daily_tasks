const pool = require('./src/config/db');

(async () => {
    try {
        await pool.query('UPDATE organizers SET approval_status = 5 WHERE approval_status = 6 OR (approval_status = 5 AND is_active = 1)');
        await pool.query('DELETE FROM organizer_statuses');
        await pool.query(`
            INSERT INTO organizer_statuses (id, code_name, label, description) VALUES
            (0, 'PENDING_REVIEW', 'Pending Review', 'Phase 1 lead application submitted (awaiting admin link dispatch)'),
            (1, 'REJECTED', 'Rejected', 'Lead application declined by admin'),
            (2, 'REGISTRATION_PENDING', 'Registration Pending', 'Admin approved lead; registration link emailed to applicant'),
            (3, 'REGISTRATION_COMPLETED', 'Registration Completed', 'Phase 2 registration and KYC documents submitted by organizer'),
            (4, 'DOCUMENTS_VERIFIED', 'Documents Verified', 'KYC documents verified and approved by admin'),
            (5, 'ACTIVE', 'Active', 'Admin approved and activated account; user entry created; login enabled')
        `);

        const [rows] = await pool.query('SELECT * FROM organizer_statuses ORDER BY id ASC');
        console.log('Updated Master Status Table:');
        console.table(rows);
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
})();

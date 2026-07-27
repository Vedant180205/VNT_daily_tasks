const pool = require("../config/db");

const emailTemplateModel = {
    getAllTemplates: async () => {
        const [rows] = await pool.query(
            "SELECT id, template_name, subject, body_html, available_variables, updated_at FROM email_templates ORDER BY template_name ASC"
        );
        return rows;
    },

    getTemplateByName: async (templateName) => {
        const [rows] = await pool.query(
            "SELECT * FROM email_templates WHERE template_name = ?",
            [templateName]
        );
        return rows[0];
    },

    getTemplateById: async (id) => {
        const [rows] = await pool.query(
            "SELECT * FROM email_templates WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    updateTemplate: async (id, subject, bodyHtml) => {
        const [result] = await pool.query(
            "UPDATE email_templates SET subject = ?, body_html = ? WHERE id = ?",
            [subject, bodyHtml, id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = emailTemplateModel;

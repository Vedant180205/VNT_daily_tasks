const searchService = require("../services/searchService");

const autocomplete = async (req, res, next) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.json({
                success: true,
                data: []
            });
        }

        // Sub-millisecond lookup using Redis ZRANGEBYLEX
        const results = await searchService.autocomplete(q);

        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    autocomplete
};

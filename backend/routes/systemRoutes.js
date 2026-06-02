const express = require('express');
const prisma = require('../config/database');
const ResponseHandler = require('../utils/responseHandler');

const router = express.Router();

/**
 * @route   GET /api/system/check-connection
 * @desc    Verify database connection status
 * @access  Public
 */
router.get('/check-connection', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        ResponseHandler.success(res, { status: 'connected', database: 'PostgreSQL' }, 'Database signal is strong and stable');
    } catch (error) {
        console.error('Database connection check failed:', error);
        ResponseHandler.error(res, 'Database signal lost in the nebula', 503, error.message);
    }
});

module.exports = router;

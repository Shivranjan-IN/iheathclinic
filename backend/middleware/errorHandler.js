const ResponseHandler = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Prisma errors
    if (err.code === 'P2002') {
        const fields = err.meta?.target?.join(', ') || 'unknown field';
        return ResponseHandler.badRequest(res, `Duplicate value: ${fields} already exists`);
    }

    if (err.code === 'P2003') {
        return ResponseHandler.badRequest(res, 'Related record not found (foreign key constraint)');
    }

    if (err.code === 'P2025') {
        return ResponseHandler.notFound(res, 'Record not found');
    }

    // PostgreSQL errors
    if (err.code === '23505') {
        return ResponseHandler.badRequest(res, 'Duplicate entry detected', err.detail);
    }

    if (err.code === '23503') {
        return ResponseHandler.badRequest(res, 'Foreign key constraint violation', err.detail);
    }

    if (err.code === '22P02') {
        return ResponseHandler.badRequest(res, 'Invalid input syntax');
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return ResponseHandler.badRequest(res, 'Validation failed', err.errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return ResponseHandler.unauthorized(res, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return ResponseHandler.unauthorized(res, 'Token expired');
    }

    // Default error
    return ResponseHandler.error(res, err.message || 'Internal server error', err.statusCode || 500);
};

module.exports = errorHandler;

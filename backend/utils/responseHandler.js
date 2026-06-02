class ResponseHandler {
    static success(res, data, message = 'Operation successful in zero-g', statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
            timestamp: new Date().toISOString()
        });
    }

    static error(res, message = 'Gravity anomaly detected', statusCode = 500, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            errors,
            timestamp: new Date().toISOString()
        });
    }

    static created(res, data, message = 'Resource launched successfully') {
        return this.success(res, data, message, 201);
    }

    static updated(res, data, message = 'Resource recalibrated successfully') {
        return this.success(res, data, message, 200);
    }

    static deleted(res, message = 'Resource vanished into the void') {
        return this.success(res, null, message, 200);
    }

    static notFound(res, message = 'Resource lost in space') {
        return this.error(res, message, 404);
    }

    static badRequest(res, message = 'Invalid trajectory', errors = null) {
        return this.error(res, message, 400, errors);
    }

    static unauthorized(res, message = 'Access denied: Clearance level insufficient') {
        return this.error(res, message, 401);
    }

    static forbidden(res, message = 'Access forbidden: Restricted sector') {
        return this.error(res, message, 403);
    }
}

module.exports = ResponseHandler;

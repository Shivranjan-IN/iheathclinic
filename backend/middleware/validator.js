const { validationResult } = require('express-validator');
const ResponseHandler = require('../utils/responseHandler');

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return ResponseHandler.badRequest(res, 'Validation failed: Protocol mismatch', errors.array());
    }

    next();
};

module.exports = validate;

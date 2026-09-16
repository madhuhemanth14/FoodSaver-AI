const { validationResult } = require('express-validator');

/**
 * Express-validator wrapper to handle validation sequentially
 * @param {Array} validations - Array of express-validator chains
 * @returns {Function} Express middleware
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const extractedErrors = errors.array().map(err => ({ field: err.path || err.param, message: err.msg }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: extractedErrors
    });
  };
};

module.exports = validate;

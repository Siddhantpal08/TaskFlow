/**
 * Joi validation middleware factory.
 * Usage: router.post('/route', validate(schema), controller)
 */
const validate = (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,   // collect all errors, not just the first
        stripUnknown: true,  // remove unknown fields
    });

    if (error) {
        const details = error.details.map((d) => d.message.replace(/"/g, "'"));
        return res.status(422).json({
            status: 'fail',
            message: 'Validation failed',
            errors: details,
        });
    }

    req.body = value; // replace body with stripped/coerced value
    next();
};

module.exports = { validate };

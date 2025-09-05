const ApiResponse = require('../../shared/utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return ApiResponse.error(res, 'Validation failed', 400, errors);
    }

    next();
  };
};

module.exports = validate;

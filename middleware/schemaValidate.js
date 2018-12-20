const { validate } = require('jsonschema');

function validateSchema(form, schema) {
  const result = validate(form, schema);

  if (!result.valid) {
    let message = result.errors.map(error => error.stack);
    let error = new Error(message.join('\n'));
    error.status = 400;
    throw error;
  }
}

module.exports = validateSchema;

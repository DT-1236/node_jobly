const { validate } = require('jsonschema');

function validateSchema(form, schema) {
  // Apparently integer values in query strings aren't coerced into int
  // So max_employees is going in as '1' instead of 1
  parseValuesIntoFloat(form);

  const result = validate(form, schema);
  if (!result.valid) {
    let message = result.errors.map(error => error.stack);
    let error = new Error(message.join('\n'));
    error.status = 400;
    throw error;
  }
  return result;
}

function parseValuesIntoFloat(form) {
  for (let key in form) {
    if (Number(form[key]) || Number(form[key]) === 0) {
      form[key] = Number(form[key]);
    }
  }
}

module.exports = validateSchema;

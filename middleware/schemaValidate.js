const { validate } = require('jsonschema');

function validateSchema(form, schema) {
  // Apparently integer values in query strings aren't coerced into int
  // So max_employees is going in as '1' instead of 1
  if (form.hasOwnProperty('max_employees')) {
    form['max_employees'] = Number(form['max_employees']);
  }
  if (form.hasOwnProperty('min_employees')) {
    form['min_employees'] = Number(form['min_employees']);
  }
  if (form.hasOwnProperty('num_employees')) {
    form['num_employees'] = Number(form['num_employees']);
  }
  const result = validate(form, schema);
  if (!result.valid) {
    let message = result.errors.map(error => error.stack);
    let error = new Error(message.join('\n'));
    error.status = 400;
    throw error;
  }
  return result;
}

module.exports = validateSchema;

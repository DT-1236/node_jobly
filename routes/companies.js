const router = require('express').Router();
const Company = require('../models/Company');

const { validate } = require('jsonschema');
const getAllSchema = require('../schemas/getAllSchema.json');
const validateSchema = require('../middleware/schemaValidate');
const newCompanySchema = require('../schemas/newCompanySchema.json');
const updateCompanySchema = require('../schemas/updateCompanySchema.json');

router.get('/', async function getCompanies(request, response, next) {
  try {
    validateSchema(request.query, getAllSchema);

    const companies = await Company.many(request.query);
    return response.json({ companies });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async function createCompany(request, response, next) {
  try {
    validateSchema(request.body, newCompanySchema);

    const company = await Company.create(request.body);
    return response.json({ company });
  } catch (error) {
    return next(error);
  }
});

router.get('/:handle', async function getCompany(request, response, next) {
  try {
    const company = await Company.get({ handle: request.params.handle });
    return response.json({ company });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:handle', async function updateCompany(request, response, next) {
  try {
    validateSchema(request.body, updateCompanySchema);
    request.body.handle = request.params.handle;
    const company = await Company.update(request.body);
    return response.json({ company });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:handle', async function delCompany(request, response, next) {
  try {
    const company = await Company.delete({ handle: request.params.handle });
    return response.json({ company });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

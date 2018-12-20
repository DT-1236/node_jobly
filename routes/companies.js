const router = require('express').Router();
const Company = require('../models/Company');

const getAllSchema = require('../schemas/getAllCompaniesSchema.json');
const validateSchema = require('../middleware/schemaValidate');
const newCompanySchema = require('../schemas/newCompanySchema.json');
const updateCompanySchema = require('../schemas/updateCompanySchema.json');

router.get('/', async function getCompanies(request, response, next) {
  try {
    const form = request.query;
    if (
      form.hasOwnProperty('max_employees') &&
      form.hasOwnProperty('min_employees') &&
      Number(form.max_employees) < Number(form.min_employees)
    ) {
      let error = new Error('max_employees must be greater than min_employees');
      error.status = 400;
      throw error;
    }
    validateSchema(form, getAllSchema);
    const companies = await Company.many(form);
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

router.put('/:handle', updateCompany);
router.patch('/:handle', updateCompany);
async function updateCompany(request, response, next) {
  try {
    if (Object.keys(request.body).length === 0) {
      throw new Error(`Empty Update Request`);
    }
    validateSchema(request.body, updateCompanySchema);
    request.body.handle = request.params.handle;
    const company = await Company.update(request.body);
    return response.json({ company });
  } catch (error) {
    return next(error);
  }
}

router.delete('/:handle', async function delCompany(request, response, next) {
  try {
    const message = await Company.delete({ handle: request.params.handle });
    return response.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

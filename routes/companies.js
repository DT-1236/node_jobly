const router = require('express').Router();
const Company = require('../models/Company');
const db = require('./db');

router.get('/', async function getCompanies(request, response, next) {
  const companies = await Company.many({});
  return response.json({ companies });
});

router.post('/', async function createCompany(request, response, next) {
  const company = await Company.create({});
  return response.json({ company });
});

router.get('/:handle', async function getCompany(request, response, next) {
  const company = Company.get({ handle: request.params.handle });
  return response.json({ company });
});

router.patch('/:handle', async function updateCompany(request, response, next) {
  const company = Company.update({});
  return response.json({ company });
});

router.delete('/:handle', async function delCompany(request, response, next) {
  const company = Company.delete({});
  return response.json({ company });
});

module.exports = router;

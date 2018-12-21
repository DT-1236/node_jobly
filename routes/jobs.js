const router = require('express').Router();
const Job = require('../models/Job');

const { checkIfLoggedIn, checkIfAdmin } = require('../middleware/auth');

const getAllSchema = require('../schemas/getAllJobsSchema.json');
const validateSchema = require('../middleware/schemaValidate');
const newJobSchema = require('../schemas/newJobSchema.json');
const updateJobSchema = require('../schemas/updateJobSchema.json');

router.get('/', checkIfLoggedIn, async function getjobs(
  request,
  response,
  next
) {
  try {
    const queryString = request.query;
    validateSchema(queryString, getAllSchema);
    const jobs = await Job.many(queryString);
    return response.json({ jobs });
  } catch (error) {
    return next(error);
  }
});

router.post('/', checkIfAdmin, async function createJob(
  request,
  response,
  next
) {
  try {
    validateSchema(request.body, newJobSchema);

    const job = await Job.create(request.body);
    return response.json({ job });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', checkIfLoggedIn, async function getJob(
  request,
  response,
  next
) {
  try {
    const job = await Job.get({ id: request.params.id });
    return response.json({ job });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', checkIfAdmin, updateJob);
router.patch('/:id', checkIfAdmin, updateJob);
async function updateJob(request, response, next) {
  try {
    if (Object.keys(request.body).length === 0) {
      throw new Error(`Empty Update Request`);
    }
    validateSchema(request.body, updateJobSchema);
    request.body.id = request.params.id;
    const job = await Job.update(request.body);
    return response.json({ job });
  } catch (error) {
    return next(error);
  }
}

router.delete('/:id', checkIfAdmin, async function delJob(
  request,
  response,
  next
) {
  try {
    const message = await Job.delete({ id: request.params.id });
    return response.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

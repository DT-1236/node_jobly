const router = require('express').Router();
const User = require('../models/User');

const getAllSchema = require('../schemas/getAllUsersSchema.json');
const validateSchema = require('../middleware/schemaValidate');
const newUserSchema = require('../schemas/newUserSchema.json');
const updateUserSchema = require('../schemas/updateUserSchema.json');

router.get('/', async function getUsers(request, response, next) {
  try {
    const form = request.query;
    // validateSchema(form, getAllSchema);
    const users = await User.many(form);
    return response.json({ users });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async function createUser(request, response, next) {
  try {
    // console.log(`Checking body\n\n\n>>`, request.body);
    validateSchema(request.body, newUserSchema);

    const user = await User.create(request.body);
    return response.json({ user });
  } catch (error) {
    return next(error);
  }
});

router.get('/:username', async function getUser(request, response, next) {
  try {
    const user = await User.get({ username: request.params.username });
    return response.json({ user });
  } catch (error) {
    return next(error);
  }
});

router.put('/:username', updateUser);
router.patch('/:username', updateUser);
async function updateUser(request, response, next) {
  try {
    if (Object.keys(request.body).length === 0) {
      throw new Error(`Empty Update Request`);
    }
    validateSchema(request.body, updateUserSchema);
    request.body.username = request.params.username;
    const user = await User.update(request.body);
    return response.json({ user });
  } catch (error) {
    return next(error);
  }
}

router.delete('/:username', async function delUser(request, response, next) {
  try {
    const message = await User.delete({ username: request.params.username });
    return response.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

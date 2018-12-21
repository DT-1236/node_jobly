const router = require('express').Router();
const User = require('../models/User');

const validateSchema = require('../middleware/schemaValidate');
const newUserSchema = require('../schemas/newUserSchema.json');
const getAllSchema = require('../schemas/getAllUsersSchema.json');
const updateUserSchema = require('../schemas/updateUserSchema.json');

const uniqueConstraints = require('../helpers/uniqueConstraints');

router.get('/', async function getUsers(request, response, next) {
  try {
    const form = request.query;
    validateSchema(form, getAllSchema);
    const users = await User.many(form);
    return response.json({ users });
  } catch (error) {
    return next(error);
  }
});

router.post('/', async function createUser(request, response, next) {
  try {
    validateSchema(request.body, newUserSchema);
    uniqueConstraints(User, request.body);
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
    const { ...body } = request.body;
    body.username = request.params.username;
    validateSchema(body, updateUserSchema);
    uniqueConstraints(User, body);
    const user = await User.update(body);
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

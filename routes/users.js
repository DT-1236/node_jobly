const router = require('express').Router();
const User = require('../models/User');

const {
  checkIfLoggedIn,
  checkIfLoggedInAsUser,
  checkIfAdmin
} = require('../middleware/auth');

const validateSchema = require('../middleware/schemaValidate');
const newUserSchema = require('../schemas/newUserSchema.json');
const getAllSchema = require('../schemas/getAllUsersSchema.json');
const updateUserSchema = require('../schemas/updateUserSchema.json');
const { SECRET } = require('../config');
const jwt = require('jsonwebtoken');

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
    let token = jwt.sign(
      { username: user.username, is_admin: user.is_admin },
      SECRET
    );
    return response.json({ token });
  } catch (error) {
    return next(error);
  }
});

router.post('/login', async function createUser(request, response, next) {
  try {
    // validateSchema(request.body, newUserSchema);
    uniqueConstraints(User, request.body);
    const user = await User.login(request.body);
    let token = jwt.sign(
      { username: user.username, is_admin: user.is_admin },
      SECRET
    );
    return response.json({ token });
  } catch (error) {
    if (error.status === 404) {
      let newError = new Error('Invalid username/password combination.');
      newError.status = 401;
      return next(newError);
    }
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

router.put('/:username', checkIfLoggedInAsUser, updateUser);
router.patch('/:username', checkIfLoggedInAsUser, updateUser);
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

router.delete('/:username', checkIfLoggedInAsUser, async function delUser(
  request,
  response,
  next
) {
  try {
    const message = await User.delete({ username: request.params.username });
    return response.json({ message });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

let err = new Error('Unauthorized');
err.status = 401;

async function checkIfLoggedIn(request, response, next) {
  try {
    let token = request.body.token || request.query.token;
    if (!token || !jwt.verify(token, SECRET)) {
      throw err;
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

async function checkIfLoggedInAsUser(request, response, next) {
  try {
    let payload = await getPayload(request);
    if (payload.username !== request.params.username) {
      throw err;
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

async function checkIfAdmin(request, response, next) {
  try {
    let payload = await getPayload(request);
    if (!payload.is_admin) {
      throw err;
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

async function getPayload(request) {
  let token = request.body.token || request.query.token;
  if (!token) {
    throw err;
  }
  return await jwt.verify(token, SECRET);
}

module.exports = { checkIfLoggedIn, checkIfLoggedInAsUser, checkIfAdmin };

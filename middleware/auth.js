const jwt = require('jsonwebtoken');
const { SECRET } = require('../config');

let err = new Error('Unauthorized');
err.status = 401;

async function checkIfLoggedIn(request, response, next) {
  try {
    // let token = request.body.token || request.query.token;
    // Remove Bearer prefix

    let token = request.headers.authorization;
    if (!token || !jwt.verify(token.slice(7), SECRET)) {
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
  // Remove Bearer prefix
  let token = request.headers.authorization;
  if (!token) {
    throw err;
  }
  return await jwt.verify(token.slice(7), SECRET);
}

module.exports = { checkIfLoggedIn, checkIfLoggedInAsUser, checkIfAdmin };

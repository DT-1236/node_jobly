/** Express app for jobly. */

const express = require('express');
const APIError = require('./helpers/APIErrors');
const { checkPGDuplicateValue } = require('./helpers/errorHandlers');
const app = express();
app.use(express.json());

const companyRoutes = require('./routes/companies');
app.use('/companies', companyRoutes);

// add logging system

const morgan = require('morgan');
app.use(morgan('tiny'));

/** 404 handler */

app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;

  // pass the error to the next piece of middleware
  return next(err);
});

// global error handler
app.use(function(err, req, res, next) {
  checkPGDuplicateValue(err);
  // all errors that get to here get coerced into API Errors
  if (!(err instanceof APIError)) {
    err = new APIError(err.message, err.status);
  }
  return res.status(err.status).json(err);
});

module.exports = app;

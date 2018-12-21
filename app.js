/** Express app for jobly. */

const express = require('express');
const APIError = require('./helpers/APIErrors');
const {
  checkPGDuplicateValue,
  finalizeEmptyFormError
} = require('./helpers/errorHandlers');
const app = express();
app.use(express.json());

const companyRoutes = require('./routes/companies');
const jobRoutes = require('./routes/jobs');
const userRoutes = require('./routes/users');
app.use('/companies', companyRoutes);
app.use('/jobs', jobRoutes);
app.use('/users', userRoutes);

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
  finalizeEmptyFormError(err);
  // all errors that get to here get coerced into API Errors
  if (!(err instanceof APIError)) {
    err = new APIError(err.message, err.status);
  }
  if (err.status === 500) {
    console.error(
      `NEW ERROR IN ERROR HANDLER. Checking error in handler\n\n>>>>>`,
      err
    );
  }
  return res.status(err.status).json(err);
});

module.exports = app;

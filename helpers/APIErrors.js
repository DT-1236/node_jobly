/*
Designed for use with the following global error handler:

app.use(function(err, req, res, next) {
  // all errors that get to here get coerced into API Errors
  if (!(err instanceof APIError)) {
    err = new APIError(err.message, err.status);
  }
  return res.status(err.status).json(err);
});

*/

class APIError extends Error {
  constructor(message = 'Internal Server Error', status = 500) {
    super(message);
    this.status = status;
  }

  /*
      Defines the JSON representation of this class
       Automatically invoked when you pass an API Error to res.json
     */
  toJSON() {
    return {
      error: {
        message: this.message,
        status: this.status
      }
    };
  }
}

module.exports = APIError;

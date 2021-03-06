const StackTracey = require('stacktracey');

const logger = require('../helpers/logger');

const parseError = (err) => {
  const internalError = err.status >= 500;

  return {
    data: (internalError && err.data) || undefined,
    errors: err.errors || undefined,
    message: err.message,
    stack: err.stack,
    status: err.status || 500,
    type:
      (!internalError && err.type) || err.status === 504
        ? err.type
        : 'ServerError',
  };
};

const errorHandler = (err, req, res, _next) => {
  const errorDetails = parseError(err);

  const stack = new StackTracey(err.stack);
  Object.assign(errorDetails, { stack: stack[0] });

  logger.error(
    `${req.originalUrl} - ${req.method} - ${req.ip} - ${errorDetails.status} - ${errorDetails.message} - ${errorDetails.stack.beforeParse}`
  );
  res.status(errorDetails.status).json(errorDetails);
};

module.exports = errorHandler;

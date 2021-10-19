const errorHandler = (error, req, res, next) => {
  const errorStatus = error.statusCode || 500;

  res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: error.message,
  });
};

module.exports = errorHandler;

import { ApiError } from '#common/ApiError.js';
import { ApiResponse } from '#utils/apiResponse.js';

export const notFoundHandler = (req, res, next) => {
  next(new ApiError(`Not Found - ${req.originalUrl}`, 404));
};

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof Error ? 400 : 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(message, statusCode, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};

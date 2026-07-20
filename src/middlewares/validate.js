import { validationResult } from 'express-validator';
import { sendError } from '#common/responseHelper.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
    }));
    return sendError(res, 400, 'Validation failed', formattedErrors);
  }
  next();
};

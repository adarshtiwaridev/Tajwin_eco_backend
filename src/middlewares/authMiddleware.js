import { verifyAccessToken, verifyRefreshToken } from '#modules/auth/helper.js';
import { AuthRepository } from '#modules/auth/repository.js';
import { ApiError } from '#common/ApiError.js';
import { COOKIE_NAMES } from '#modules/auth/constants.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization || '';
    
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    if (!token && req.cookies) {
      token = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];
    }

    if (!token) {
      return next(new ApiError('Authentication required. Access token is missing.', 401));
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      return next(new ApiError('Authentication failed. Token is invalid or expired.', 401));
    }

    const user = await AuthRepository.findUserById(decoded.userId);
    if (!user) {
      return next(new ApiError('Authentication failed. User account does not exist or has been deleted.', 401));
    }

    req.user = user;
    req.userId = user._id.toString();

    next();
  } catch (error) {
    next(error);
  }
};

export const verifyActiveAccount = (req, res, next) => {
  if (req.user && req.user.isActive === false) {
    return next(new ApiError('Your account has been deactivated. Please contact support.', 403));
  }
  next();
};

export const validateRefreshToken = async (req, res, next) => {
  try {
    let token = null;
    if (req.body.refreshToken) {
      token = req.body.refreshToken;
    } else if (req.cookies && req.cookies[COOKIE_NAMES.REFRESH_TOKEN]) {
      token = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];
    }

    if (!token) {
      return next(new ApiError('Refresh token is required.', 401));
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return next(new ApiError('Refresh token is invalid or expired.', 401));
    }

    req.refreshToken = token;
    req.decodedRefreshToken = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

import { AuthService } from './service.js';
import { AuthDTO } from './dto.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';
import { COOKIE_NAMES, COOKIE_OPTIONS, ACCESS_COOKIE_MAX_AGE } from './constants.js';

export const login = asyncHandler(async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
  const userAgent = req.headers['user-agent'] || '';

  const { user, accessToken, refreshToken } = await AuthService.loginUser(
    req.body.email,
    req.body.password,
    ip,
    userAgent
  );

  const safeUser = AuthDTO.user(user);

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_COOKIE_MAX_AGE * 1000,
  });

  // res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
  //   ...COOKIE_OPTIONS,
  //   maxAge: COOKIE_OPTIONS.maxAge,
  // });

  return sendSuccess(res, 200, 'Login successful', { user: safeUser, accessToken });
});

export const registerEndUser = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await AuthService.registerEndUser(req.body);

  const safeUser = AuthDTO.user(user);

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_COOKIE_MAX_AGE * 1000,
  });

  // res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
  //   ...COOKIE_OPTIONS,
  //   maxAge: COOKIE_OPTIONS.maxAge,
  // });

  return sendSuccess(res, 201, 'Registration successful', { user: safeUser, accessToken });
});

export const logout = asyncHandler(async (req, res) => {
  let refreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN] || req.body.refreshToken;

  if (refreshToken) {
    await AuthService.logoutUser(refreshToken);
  }

  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, COOKIE_OPTIONS);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, COOKIE_OPTIONS);

  return sendSuccess(res, 200, 'Logged out successfully');
});

export const refreshToken = asyncHandler(async (req, res) => {
  // Use the token set by validateRefreshToken middleware
  const token = req.refreshToken;

  const { accessToken } = await AuthService.refreshAccessToken(token);

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: ACCESS_COOKIE_MAX_AGE * 1000,
  });

  return sendSuccess(res, 200, 'Token refreshed successfully', { accessToken });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.getUserProfile(req.userId);
  return sendSuccess(res, 200, 'Profile retrieved successfully', { user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.userId, req.body);
  return sendSuccess(res, 200, 'Profile updated successfully', { user });
});

export const changePassword = asyncHandler(async (req, res) => {
  await AuthService.changePassword(req.userId, req.body.currentPassword, req.body.newPassword);
  return sendSuccess(res, 200, 'Password changed successfully');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await AuthService.forgotPassword(req.body.email);
  return sendSuccess(res, 200, 'Password reset link sent if email exists', result);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = req.query.token || req.body.token;
  const result = await AuthService.resetPassword(token, req.body.password);
  return sendSuccess(res, 200, 'Password reset successful', result);
});

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  DISTRIBUTOR: 'DISTRIBUTOR',
  RETAILER: 'RETAILER',
  USER: 'USER',
};

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m', // 15 minutes
  REFRESH_TOKEN: '7d', // 7 days
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
};

// Cookie options for HttpOnly cookies
export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

// Expiry dates in seconds/milliseconds for cookies matching token expiry
export const ACCESS_COOKIE_MAX_AGE = 1 * 24 * 60 * 60; // 15 minutes in seconds
export const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

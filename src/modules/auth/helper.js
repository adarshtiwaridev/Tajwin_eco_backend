import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets are not defined in environment variables');
}

/**
 * Hash a plain text password
 * @param {string} password 
 * @returns {Promise<string>} Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compare plain text password with its hashed version
 * @param {string} password 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>} Match result
 */
export const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Generate standard access token (JWT)
 * @param {object} payload - Token payload
 * @returns {string} Signed JWT
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generate standard refresh token (JWT)
 * @param {object} payload - Token payload
 * @returns {string} Signed JWT
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

/**
 * Verify access token (JWT)
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify refresh token (JWT)
 * @param {string} token 
 * @returns {object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};

/**
 * Extracts a cookie value from a Next.js Request or standard Request
 * @param {Request} req 
 * @param {string} cookieName 
 * @returns {string|null}
 */
export const getCookieValue = (req, cookieName) => {
  if (req.cookies && typeof req.cookies.get === 'function') {
    return req.cookies.get(cookieName)?.value || null;
  }
  const cookieHeader = req.headers.get('cookie') || '';
  if (!cookieHeader) return null;
  
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const trimmed = c.trim();
      const index = trimmed.indexOf('=');
      if (index === -1) return [trimmed, ''];
      return [trimmed.substring(0, index), trimmed.substring(index + 1)];
    })
  );
  return cookies[cookieName] || null;
};


import crypto from 'crypto';

/**
 * Generate a unique SKU
 * Format: LAP-{BRAND}-{RANDOM_STRING}
 * @param {string} brand
 * @returns {string}
 */
export const generateSKU = (brand) => {
  const brandCode = brand.substring(0, 4).toUpperCase();
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `LAP-${brandCode}-${randomStr}`;
};

/**
 * Generate a URL-friendly slug
 * @param {string} text
 * @returns {string}
 */
export const generateSlug = (text) => {
  const baseSlug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -

  const randomString = crypto.randomBytes(2).toString('hex');
  return `${baseSlug}-${randomString}`;
};

/**
 * Mock file upload to Cloudinary or generic storage
 * @param {Buffer} fileBuffer
 * @param {string} filename
 * @returns {Promise<string>} Uploaded file URL
 */
export const uploadFileToStorage = async (fileBuffer, filename) => {
  // In a real application, implement Cloudinary / S3 upload here
  // For now, simulate an upload delay and return a mock URL
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://storage.example.com/uploads/${Date.now()}-${filename}`);
    }, 500);
  });
};

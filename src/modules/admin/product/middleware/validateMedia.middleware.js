import { fileTypeFromBuffer } from 'file-type';
import { sendError } from '#common/responseHelper.js';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE
} from '#config/upload.config.js';

export const validateMediaMiddleware = async (req, res, next) => {
  if (!req.files) {
    return next();
  }

  try {
    // Process all files in req.files (which is an object of arrays from upload.fields)
    for (const fieldName in req.files) {
      const fileArray = req.files[fieldName];
      
      for (const file of fileArray) {
        // 1. Identify Magic Bytes using file-type
        const fileTypeResult = await fileTypeFromBuffer(file.buffer);
        
        if (!fileTypeResult) {
          return sendError(res, 415, `Unknown or invalid file type for file: ${file.originalname}`);
        }

        const actualMime = fileTypeResult.mime;

        // 2. Validate Image vs Video Limits and Types
        const isImage = ALLOWED_IMAGE_TYPES.includes(actualMime);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(actualMime);

        if (!isImage && !isVideo) {
          return sendError(res, 415, `Unsupported file type: ${actualMime}. File: ${file.originalname}`);
        }

        // 3. Enforce Field-Specific Types
        if (fieldName === 'video' && !isVideo) {
          return sendError(res, 415, `The 'video' field requires a valid video format (e.g., MP4). Received: ${actualMime}`);
        }

        if ((fieldName === 'featuredImage' || fieldName === 'images') && !isImage) {
          return sendError(res, 415, `The '${fieldName}' field requires a valid image format. Received: ${actualMime}`);
        }

        // 4. Validate Sizes
        if (isImage && file.size > MAX_IMAGE_SIZE) {
          return sendError(res, 400, `Image exceeds the maximum allowed size of 10MB. File: ${file.originalname}`);
        }

        if (isVideo && file.size > MAX_VIDEO_SIZE) {
          return sendError(res, 400, `Video exceeds the maximum allowed size of 200MB. File: ${file.originalname}`);
        }

        // Optional: Reassign the actual strictly validated mime type to the file object
        file.mimetype = actualMime;
      }
    }
    
    next();
  } catch (error) {
    console.error('Media Validation Error:', error);
    return sendError(res, 500, 'Error validating media files');
  }
};

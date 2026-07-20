import cloudinary from '#config/cloudinary.js';
import stream from 'stream';

/**
 * Uploads a file buffer directly to Cloudinary via stream.
 * @param {Buffer} fileBuffer
 * @param {string} folderPath
 * @param {string} resourceType 'image', 'video', or 'auto'
 * @returns {Promise<Object>} Media metadata object
 */
export const uploadToCloudinary = (fileBuffer, folderPath, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        resource_type: resourceType
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        
        const mediaData = {
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
          duration: result.duration
        };

        resolve(mediaData);
      }
    );

    // Convert Buffer to Readable Stream and pipe it to Cloudinary
    const readableStream = new stream.PassThrough();
    readableStream.end(fileBuffer);
    readableStream.pipe(uploadStream);
  });
};

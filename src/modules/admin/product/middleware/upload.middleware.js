import multer from 'multer';

// Use memory storage to process files before uploading to Cloudinary
const storage = multer.memoryStorage();

// We do NOT use Multer's fileFilter here because it only checks the provided mimetype string,
// which is easily spoofed. Instead, we allow multer to parse all files up to the absolute
// maximum limit (200MB for videos), and then use a custom middleware to strictly validate
// file sizes per type and check the magic bytes using `file-type`.

export const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB global limit
  },
});

export const uploadProductImages = upload.fields([
  { name: 'featuredImage', maxCount: 1 },
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
]);

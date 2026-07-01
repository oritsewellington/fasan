import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
};

// Memory storage — we hand the buffer straight to Cloudinary, nothing hits local disk
const memoryStorage = multer.memoryStorage();

export const uploadCandidate = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadBanner = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/**
 * Uploads a buffer to Cloudinary inside a given folder, resized/cropped as requested.
 * Returns { url, publicId }.
 */
export function uploadToCloudinary(
  buffer,
  { folder, width, height, crop = "fill" },
) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation:
          width && height
            ? [{ width, height, crop, gravity: "face" }]
            : undefined,
        format: "webp",
        quality: "auto:good",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      },
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error("Cloudinary delete failed:", err.message);
  }
}

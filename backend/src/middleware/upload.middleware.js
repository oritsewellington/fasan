import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

const CANDIDATE_DIR = path.join(process.cwd(), "uploads", "candidates");
const BANNER_DIR = path.join(process.cwd(), "uploads", "banners");

[CANDIDATE_DIR, BANNER_DIR].forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const imageFilter = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, and WebP images are allowed."), false);
};

function makeStorage(dir) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
      cb(null, `${uuidv4()}${ext}`);
    },
  });
}

export const uploadCandidate = multer({
  storage: makeStorage(CANDIDATE_DIR),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
export const uploadBanner = multer({
  storage: makeStorage(BANNER_DIR),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// FIXED: Removed 'req' parameter. Now returns a clean relative URL path string.
export function buildUrl(subPath, filename) {
  return `/uploads/${subPath}/${filename}`;
}

export function deleteFile(filePath) {
  if (!filePath) return;
  const filename = path.basename(filePath);
  [CANDIDATE_DIR, BANNER_DIR].forEach((dir) => {
    const full = path.join(dir, filename);
    if (fs.existsSync(full)) fs.unlink(full, () => {});
  });
}

export async function resizeAndConvert(
  inputPath,
  outputPath,
  width,
  height,
  fit = "cover",
) {
  await sharp(inputPath)
    .resize(width, height, { fit, position: "top" })
    .webp({ quality: 85 })
    .toFile(outputPath);
  fs.unlink(inputPath, () => {});
}

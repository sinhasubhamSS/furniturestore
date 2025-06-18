// middleware/multer.ts
import multer from "multer";

const storage = multer.memoryStorage(); // keep file in RAM
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
});

export default upload;

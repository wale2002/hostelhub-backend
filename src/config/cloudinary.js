// // config/cloudinary.js
// const cloudinary = require("cloudinary").v2;
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// // Ensure Uploads folder exists
// const UPLOAD_DIR = path.join(__dirname, "../Uploads");
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// // Configure multer (optional, if used directly in other parts of the app)
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: UPLOAD_DIR,
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}_${file.originalname}`);
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith("image/")) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed"), false);
//     }
//   },
// });

// module.exports = { cloudinary, upload };

// config/cloudinary.js
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = { cloudinary };

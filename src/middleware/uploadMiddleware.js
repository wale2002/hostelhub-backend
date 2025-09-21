// // middleware/uploadMiddleware.js
// const multer = require("multer");
// const fs = require("fs");
// const path = require("path");

// // Ensure Uploads folder exists
// const UPLOAD_DIR = path.join(__dirname, "../Uploads");
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// // Configure multer for image uploads
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

// module.exports = upload.single("image"); // Export as single file upload middleware

// middleware/uploadMiddleware.js
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Ensure Uploads folder exists
const UPLOAD_DIR = path.join(__dirname, "../Uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Configure multer for image uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

module.exports = upload.array("images", 10); // Allow up to 10 images under 'images' field

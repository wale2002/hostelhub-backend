// services/cloudinaryService.js
const { cloudinary } = require("../config/cloudinary");
const fs = require("fs");

async function uploadImage(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    return result.secure_url;
  } catch (error) {
    throw error;
  }
}

module.exports = { uploadImage };

const Estate = require("../models/Estate");
const { uploadImage } = require("../services/cloudinaryService");
const fs = require("fs");

// ✅ Correct for multiple files
exports.createEstate = async (req, res, next) => {
  try {
    const { name, location, description } = req.body;

    if (req.user.role !== "superagent") {
      return res
        .status(403)
        .json({ message: "Only superagents can create estates" });
    }

    const estate = new Estate({
      name,
      location,
      description,
      superagent: req.user.id,
    });

    // ✅ Handle multiple files
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const imageUrl = await uploadImage(file.path);
          fs.unlinkSync(file.path);
          return imageUrl;
        })
      );
      estate.images = imageUrls;
    }

    await estate.save();
    res.status(201).json(estate);
  } catch (err) {
    // ✅ Clean up multiple files
    if (req.files) {
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }
    next(err);
  }
};

exports.updateEstate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, location, description } = req.body;

    if (req.user.role !== "superagent") {
      return res
        .status(403)
        .json({ message: "Only superagents can update estates" });
    }

    const estate = await Estate.findById(id);
    if (!estate) {
      return res.status(404).json({ message: "Estate not found" });
    }

    // Ensure the superagent owns this estate
    if (estate.superagent.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this estate" });
    }

    console.log("req.file:", req.file); // Debug: Check if file is received

    if (name) estate.name = name;
    if (location) estate.location = location;
    if (description) estate.description = description;

    // In updateEstate, replace the file handling section with:
    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const imageUrl = await uploadImage(file.path);
          fs.unlinkSync(file.path);
          return imageUrl;
        })
      );
      estate.images = [...estate.images, ...imageUrls];
    }

    await estate.save();
    res.json(estate);
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    next(err);
  }
};

exports.deleteEstate = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "superagent") {
      return res
        .status(403)
        .json({ message: "Only superagents can delete estates" });
    }

    const estate = await Estate.findById(id);
    if (!estate) {
      return res.status(404).json({ message: "Estate not found" });
    }

    if (estate.superagent.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this estate" });
    }

    await estate.deleteOne();
    res.json({ message: "Estate deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// controllers/estateController.js
exports.getEstates = async (req, res, next) => {
  try {
    // Show ALL estates with FULL details to everyone
    const estates = await Estate.find();
    // .populate("superagent", "name email") // Full superagent info
    // .sort({ createdAt: -1 }); // Most recent first

    res.json(estates);
  } catch (err) {
    next(err);
  }
};

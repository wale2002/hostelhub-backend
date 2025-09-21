// controllers/hostelController.js
const mongoose = require("mongoose");
const Hostel = require("../models/Hostel");
const Estate = require("../models/Estate");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { uploadImage } = require("../services/cloudinaryService");
const fs = require("fs");

exports.createHostel = async (req, res, next) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    const { name, estateId, rooms, price, landlordId } = req.body;

    // Restrict to superagents
    if (req.user.role !== "superagent") {
      return res
        .status(403)
        .json({ message: "Only superagents can create hostels" });
    }
    // Validate estate
    const estate = await Estate.findById(estateId);
    if (!estate) {
      return res.status(404).json({ message: "Estate not found" });
    }
    if (estate.superagent.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to create hostel for this estate" });
    }

    // Validate landlord
    if (!landlordId) {
      return res.status(400).json({ message: "landlordId is required" });
    }
    const landlord = await User.findById(landlordId);
    if (!landlord || landlord.role !== "landlord") {
      return res.status(400).json({ message: "Invalid or non-landlord ID" });
    }

    const hostel = new Hostel({
      name,
      estate: estateId,
      owner: landlordId, // Direct link to landlord
      rooms,
      price,
    });

    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const imageUrl = await uploadImage(file.path);
          fs.unlinkSync(file.path);
          return imageUrl;
        })
      );
      hostel.images = imageUrls;
    }

    await hostel.save();

    // Notify landlord
    const notification = new Notification({
      user: landlordId,
      message: `New hostel "${hostel.name}" created in estate "${estate.name}" by superagent.`,
      read: false,
    });
    await notification.save();

    res.status(201).json(hostel);
  } catch (err) {
    if (req.files) {
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }
    next(err);
  }
};

exports.updateHostel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, estateId, rooms, price, landlordId } = req.body;

    if (req.user.role !== "superagent") {
      return res
        .status(403)
        .json({ message: "Only superagents can update hostels" });
    }

    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    // Validate estate if provided
    if (estateId && estateId !== hostel.estate.toString()) {
      const newEstate = await Estate.findById(estateId);
      if (!newEstate) {
        return res.status(404).json({ message: "New estate not found" });
      }
      if (newEstate.superagent.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized for this estate" });
      }
      hostel.estate = estateId;
    }

    // Validate landlord if provided
    if (landlordId && landlordId !== hostel.owner.toString()) {
      const newLandlord = await User.findById(landlordId);
      if (!newLandlord || newLandlord.role !== "landlord") {
        return res.status(400).json({ message: "Invalid or non-landlord ID" });
      }
      hostel.owner = landlordId;
    }

    if (name) hostel.name = name;
    if (rooms) hostel.rooms = rooms;
    if (price) hostel.price = price;

    if (req.files && req.files.length > 0) {
      const imageUrls = await Promise.all(
        req.files.map(async (file) => {
          const imageUrl = await uploadImage(file.path);
          fs.unlinkSync(file.path);
          return imageUrl;
        })
      );
      hostel.images = [...hostel.images, ...imageUrls];
    }

    await hostel.save();
    res.json(hostel);
  } catch (err) {
    if (req.files) {
      req.files.forEach((file) => fs.unlinkSync(file.path));
    }
    next(err);
  }
};

exports.getHostels = async (req, res, next) => {
  try {
    const hostels = await Hostel.find().populate("estate");
    res.json(hostels);
  } catch (err) {
    next(err);
  }
};

exports.deleteHostel = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "superagent") {
      return res
        .status(403)
        .json({ message: "Only superagents can delete hostels" });
    }

    const hostel = await Hostel.findById(id);
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" });
    }

    const estate = await Estate.findById(hostel.estate);
    if (estate.superagent.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this hostel" });
    }

    await hostel.deleteOne();
    res.json({ message: "Hostel deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getHostelsByEstate = async (req, res, next) => {
  try {
    const { estateId } = req.params;
    const estate = await Estate.findById(estateId);
    if (!estate) {
      return res.status(404).json({ message: "Estate not found" });
    }

    // Allow everyone to view hostels, but superagents need ownership check
    if (
      req.user &&
      req.user.role === "superagent" &&
      estate.superagent.toString() !== req.user.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized for this estate" });
    }

    const hostels = await Hostel.find({ estate: estateId }).populate("estate");
    res.json(hostels);
  } catch (err) {
    next(err);
  }
};

exports.getHostel = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(`[getHostel] Request received for hostel ID: ${id}`);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log(`[getHostel] Invalid ObjectId: ${id}`);
      return res.status(400).json({ message: "Invalid hostel ID format" });
    }

    const hostel = await Hostel.findById(id).populate("estate");
    if (!hostel) {
      console.log(`[getHostel] No hostel found for ID: ${id}`);
      return res.status(404).json({ message: "Hostel not found" });
    }

    if (!hostel.estate) {
      console.log(`[getHostel] Hostel ${id} has no associated estate`);
      hostel.estate = {
        name: "Unknown Estate",
        location: "Unknown Location",
        description: "No estate information available",
        images: [],
      };
    }

    console.log(`[getHostel] Successfully found hostel: ${hostel.name}`);
    res.status(200).json(hostel);
  } catch (err) {
    console.error(
      `[getHostel] Error fetching hostel ${id}:`,
      err.message,
      err.stack
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

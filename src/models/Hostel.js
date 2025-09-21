// // models/Hostel.js
// const mongoose = require("mongoose");

// const hostelSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   estate: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Estate",
//     required: true,
//   },
//   rooms: { type: Number, required: true },
//   price: { type: Number, required: true },
//   images: [{ type: String }],
// });

// module.exports = mongoose.model("Hostel", hostelSchema);

// models/Hostel.js
const mongoose = require("mongoose");

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    estate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // Direct link to landlord
    },
    rooms: { type: Number, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

hostelSchema.index({ owner: 1 }); // Index for faster queries by owner

module.exports = mongoose.model("Hostel", hostelSchema);

// // models/Estate.js
// const mongoose = require("mongoose");

// const estateSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   location: { type: String, required: true },
//   description: { type: String },
//   superagent: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional superagent
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   images: [{ type: String }],
// });

// module.exports = mongoose.model("Estate", estateSchema);

// models/Estate.js
const mongoose = require("mongoose");

const estateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    superagent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Superagent who created/manages the estate
    images: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Estate", estateSchema);

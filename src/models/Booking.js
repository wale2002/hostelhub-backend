// const mongoose = require("mongoose");
// const bookingSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   hostel: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Hostel",
//     required: true,
//   },
//   type: { type: String, enum: ["inspection", "tour"], required: true },
//   date: Date,
//   status: { type: String, default: "pending" },
// });

// bookingSchema.pre("save", async function (next) {
//   if (this.isModified("hostel") || this.isNew) {
//     const hostel = await mongoose.model("Hostel").findById(this.hostel);
//     if (!hostel) {
//       return next(new Error("Invalid hostel ID"));
//     }
//   }
//   next();
// });

// module.exports = mongoose.model("Booking", bookingSchema);

// models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hostel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hostel",
    required: true,
  },
  type: {
    type: String,
    enum: ["paynow", "virtual tour", "physical tour"],
    required: true,
  },
  date: Date,
  status: { type: String, default: "pending" },
});

bookingSchema.pre("save", async function (next) {
  if (this.isModified("hostel") || this.isNew) {
    const hostel = await mongoose.model("Hostel").findById(this.hostel);
    if (!hostel) {
      return next(new Error("Invalid hostel ID"));
    }
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);

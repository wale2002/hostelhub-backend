// // // // controllers/bookingController.js
// // // const Booking = require("../models/Booking");
// // // const Estate = require("../models/Estate");
// // // const Payment = require("../models/Payment");
// // // const Notification = require("../models/Notification");
// // // const Hostel = require("../models/Hostel");
// // // const User = require("../models/User");
// // // const nodemailer = require("nodemailer");

// // // const transporter = nodemailer.createTransport({
// // //   service: "gmail",
// // //   auth: {
// // //     user: process.env.EMAIL_USER,
// // //     pass: process.env.EMAIL_PASS,
// // //   },
// // // });

// // // exports.createBooking = async (req, res, next) => {
// // //   try {
// // //     const { type, hostelId, date } = req.body;

// // //     if (!["paynow", "virtual tour", "physical tour"].includes(type)) {
// // //       return res.status(400).json({ error: "Invalid booking type" });
// // //     }

// // //     const hostel = await Hostel.findById(hostelId).populate("estate");
// // //     if (!hostel) {
// // //       return res.status(404).json({ error: "Hostel not found" });
// // //     }

// // //     const booking = new Booking({
// // //       user: req.user.id,
// // //       hostel: hostelId,
// // //       type,
// // //       date,
// // //     });
// // //     await booking.save();

// // //     if (type !== "paynow") {
// // //       const user = await User.findById(req.user.id).select(
// // //         "name phoneNumber email"
// // //       );
// // //       const superagent = await User.findById(hostel.estate.superagent).select(
// // //         "email phoneNumber"
// // //       );

// // //       // Send notification to superagent
// // //       const notification = new Notification({
// // //         user: hostel.estate.superagent,
// // //         message: `New ${type} request for ${hostel.name} by ${user.name} (${user.email})`,
// // //       });
// // //       await notification.save();

// // //       // Send email to superagent
// // //       const mailOptions = {
// // //         from: process.env.EMAIL_USER,
// // //         to: superagent.email,
// // //         subject: `New ${type} Request for ${hostel.name}`,
// // //         text: `A new ${type} request has been made for ${hostel.name} by ${
// // //           user.name
// // //         }.\n\nContact Details:\nName: ${user.name}\nEmail: ${
// // //           user.email
// // //         }\nPhone: ${
// // //           user.phoneNumber || "Not provided"
// // //         }\n\nPlease confirm the booking in the dashboard.`,
// // //       };
// // //       await transporter.sendMail(mailOptions);
// // //       console.log("Email sent to superagent:", superagent.email);

// // //       // Log WhatsApp URL for superagent
// // //       if (superagent.phoneNumber) {
// // //         const message = encodeURIComponent(
// // //           `New ${type} request for ${hostel.name} by ${user.name}. Contact: ${
// // //             user.phoneNumber || user.email
// // //           }`
// // //         );
// // //         const whatsappUrl = `https://api.whatsapp.com/send?phone=${superagent.phoneNumber}&text=${message}`;
// // //         console.log("WhatsApp URL for superagent:", whatsappUrl);
// // //       }
// // //     }

// // //     res.status(201).json(booking);
// // //   } catch (err) {
// // //     console.error("Error creating booking:", err);
// // //     res.status(500).json({ error: "Server error", details: err.message });
// // //   }
// // // };

// // // exports.confirmBooking = async (req, res, next) => {
// // //   try {
// // //     const { bookingId } = req.params;
// // //     const booking = await Booking.findById(bookingId).populate("hostel");

// // //     if (!booking) {
// // //       return res.status(404).json({ error: "Booking not found" });
// // //     }

// // //     if (!booking.hostel) {
// // //       return res
// // //         .status(404)
// // //         .json({ error: "Hostel not found for this booking" });
// // //     }

// // //     if (booking.type === "paynow") {
// // //       return res
// // //         .status(400)
// // //         .json({ error: "Paynow bookings are auto-confirmed after payment" });
// // //     }

// // //     const estate = await Estate.findOne({
// // //       _id: booking.hostel.estate,
// // //       superagent: req.user.id,
// // //     });
// // //     if (!estate && req.user.role !== "superagent") {
// // //       return res
// // //         .status(403)
// // //         .json({ error: "Not authorized to confirm this booking" });
// // //     }

// // //     booking.status = "confirmed";
// // //     await booking.save();

// // //     const notification = new Notification({
// // //       user: booking.user,
// // //       message: `Your ${booking.type} request for ${
// // //         booking.hostel.name
// // //       } has been confirmed for ${new Date(booking.date).toLocaleDateString()}.`,
// // //     });
// // //     await notification.save();

// // //     res.json({ message: "Booking confirmed", booking });
// // //   } catch (err) {
// // //     console.error("Error confirming booking:", err);
// // //     res.status(500).json({ error: "Server error", details: err.message });
// // //   }
// // // };

// // // exports.confirmMultipleBookings = async (req, res, next) => {
// // //   try {
// // //     const { bookingIds } = req.body;
// // //     if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
// // //       return res.status(400).json({ error: "No booking IDs provided" });
// // //     }

// // //     const estateIds = await Estate.find({ superagent: req.user.id })
// // //       .select("_id")
// // //       .lean()
// // //       .then((estates) => estates.map((e) => e._id));
// // //     const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
// // //       .select("_id")
// // //       .lean()
// // //       .then((hostels) => hostels.map((h) => h._id));

// // //     const bookings = await Booking.find({
// // //       _id: { $in: bookingIds },
// // //       hostel: { $in: hostelIds },
// // //       status: "pending",
// // //       type: { $in: ["virtual tour", "physical tour"] },
// // //     }).populate("hostel user");

// // //     if (bookings.length === 0) {
// // //       return res.status(400).json({ error: "No valid bookings to confirm" });
// // //     }

// // //     await Booking.updateMany(
// // //       { _id: { $in: bookings.map((b) => b._id) } },
// // //       { status: "confirmed" }
// // //     );

// // //     for (const booking of bookings) {
// // //       const notification = new Notification({
// // //         user: booking.user,
// // //         message: `Your ${booking.type} request for ${
// // //           booking.hostel.name
// // //         } has been confirmed for ${new Date(
// // //           booking.date
// // //         ).toLocaleDateString()}.`,
// // //       });
// // //       await notification.save();
// // //     }

// // //     res.json({ message: "Selected bookings confirmed" });
// // //   } catch (err) {
// // //     console.error("Error confirming multiple bookings:", err);
// // //     res.status(500).json({ error: "Server error", details: err.message });
// // //   }
// // // };

// // // exports.getBookings = async (req, res, next) => {
// // //   try {
// // //     const bookings = await Booking.find({ user: req.user.id }).populate(
// // //       "hostel"
// // //     );
// // //     res.json(bookings);
// // //   } catch (err) {
// // //     console.error("Error fetching bookings:", err);
// // //     res.status(500).json({ error: "Server error", details: err.message });
// // //   }
// // // };

// // // controllers/bookingController.js
// // const Booking = require("../models/Booking");
// // const Estate = require("../models/Estate");
// // const Payment = require("../models/Payment");
// // const Notification = require("../models/Notification");
// // const Hostel = require("../models/Hostel");
// // const User = require("../models/User");
// // const nodemailer = require("nodemailer");

// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// // exports.createBooking = async (req, res, next) => {
// //   try {
// //     const { type, hostelId, date } = req.body;

// //     if (!["paynow", "tour", "inspection"].includes(type)) {
// //       return res.status(400).json({ error: "Invalid booking type" });
// //     }

// //     const hostel = await Hostel.findById(hostelId).populate("estate");
// //     if (!hostel) {
// //       return res.status(404).json({ error: "Hostel not found" });
// //     }

// //     const booking = new Booking({
// //       user: req.user.id,
// //       hostel: hostelId,
// //       type,
// //       date,
// //     });
// //     await booking.save();

// //     if (type !== "paynow") {
// //       const user = await User.findById(req.user.id).select(
// //         "name phoneNumber email"
// //       );
// //       const superagent = await User.findById(hostel.estate.superagent).select(
// //         "email phoneNumber"
// //       );

// //       // Send notification to superagent
// //       const notification = new Notification({
// //         user: hostel.estate.superagent,
// //         message: `New ${type} request for ${hostel.name} by ${user.name} (${user.email})`,
// //       });
// //       await notification.save();

// //       // Send email to superagent
// //       const mailOptions = {
// //         from: process.env.EMAIL_USER,
// //         to: superagent.email,
// //         subject: `New ${type} Request for ${hostel.name}`,
// //         text: `A new ${type} request has been made for ${hostel.name} by ${
// //           user.name
// //         }.\n\nContact Details:\nName: ${user.name}\nEmail: ${
// //           user.email
// //         }\nPhone: ${
// //           user.phoneNumber || "Not provided"
// //         }\n\nPlease confirm the booking in the dashboard.`,
// //       };
// //       await transporter.sendMail(mailOptions);
// //       console.log("Email sent to superagent:", superagent.email);

// //       // Log WhatsApp URL for superagent
// //       if (superagent.phoneNumber) {
// //         const message = encodeURIComponent(
// //           `New ${type} request for ${hostel.name} by ${user.name}. Contact: ${
// //             user.phoneNumber || user.email
// //           }`
// //         );
// //         const whatsappUrl = `https://api.whatsapp.com/send?phone=${superagent.phoneNumber}&text=${message}`;
// //         console.log("WhatsApp URL for superagent:", whatsappUrl);
// //       }
// //     }

// //     res.status(201).json(booking);
// //   } catch (err) {
// //     console.error("Error creating booking:", err);
// //     res.status(500).json({ error: "Server error", details: err.message });
// //   }
// // };

// // exports.confirmBooking = async (req, res, next) => {
// //   try {
// //     const { bookingId } = req.params;
// //     const booking = await Booking.findById(bookingId).populate("hostel");

// //     if (!booking) {
// //       return res.status(404).json({ error: "Booking not found" });
// //     }

// //     if (!booking.hostel) {
// //       return res
// //         .status(404)
// //         .json({ error: "Hostel not found for this booking" });
// //     }

// //     if (booking.type === "paynow") {
// //       return res
// //         .status(400)
// //         .json({ error: "Paynow bookings are auto-confirmed after payment" });
// //     }

// //     const estate = await Estate.findOne({
// //       _id: booking.hostel.estate,
// //       superagent: req.user.id,
// //     });
// //     if (!estate && req.user.role !== "superagent") {
// //       return res
// //         .status(403)
// //         .json({ error: "Not authorized to confirm this booking" });
// //     }

// //     booking.status = "confirmed";
// //     await booking.save();

// //     const notification = new Notification({
// //       user: booking.user,
// //       message: `Your ${booking.type} request for ${
// //         booking.hostel.name
// //       } has been confirmed for ${new Date(booking.date).toLocaleDateString()}.`,
// //     });
// //     await notification.save();

// //     res.json({ message: "Booking confirmed", booking });
// //   } catch (err) {
// //     console.error("Error confirming booking:", err);
// //     res.status(500).json({ error: "Server error", details: err.message });
// //   }
// // };

// // exports.confirmMultipleBookings = async (req, res, next) => {
// //   try {
// //     const { bookingIds } = req.body;
// //     if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
// //       return res.status(400).json({ error: "No booking IDs provided" });
// //     }

// //     const estateIds = await Estate.find({ superagent: req.user.id })
// //       .select("_id")
// //       .lean()
// //       .then((estates) => estates.map((e) => e._id));
// //     const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
// //       .select("_id")
// //       .lean()
// //       .then((hostels) => hostels.map((h) => h._id));

// //     const bookings = await Booking.find({
// //       _id: { $in: bookingIds },
// //       hostel: { $in: hostelIds },
// //       status: "pending",
// //       type: { $in: ["tour", "inspection"] },
// //     }).populate("hostel user");

// //     if (bookings.length === 0) {
// //       return res.status(400).json({ error: "No valid bookings to confirm" });
// //     }

// //     await Booking.updateMany(
// //       { _id: { $in: bookings.map((b) => b._id) } },
// //       { status: "confirmed" }
// //     );

// //     for (const booking of bookings) {
// //       const notification = new Notification({
// //         user: booking.user,
// //         message: `Your ${booking.type} request for ${
// //           booking.hostel.name
// //         } has been confirmed for ${new Date(
// //           booking.date
// //         ).toLocaleDateString()}.`,
// //       });
// //       await notification.save();
// //     }

// //     res.json({ message: "Selected bookings confirmed" });
// //   } catch (err) {
// //     console.error("Error confirming multiple bookings:", err);
// //     res.status(500).json({ error: "Server error", details: err.message });
// //   }
// // };

// // exports.getBookings = async (req, res, next) => {
// //   try {
// //     const bookings = await Booking.find({ user: req.user.id }).populate(
// //       "hostel"
// //     );
// //     res.json(bookings);
// //   } catch (err) {
// //     console.error("Error fetching bookings:", err);
// //     res.status(500).json({ error: "Server error", details: err.message });
// //   }
// // };

// // exports.getPendingBookings = async (req, res, next) => {
// //   try {
// //     const estateIds = await Estate.find({ superagent: req.user.id })
// //       .select("_id")
// //       .lean()
// //       .then((estates) => estates.map((e) => e._id));
// //     const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
// //       .select("_id")
// //       .lean()
// //       .then((hostels) => hostels.map((h) => h._id));

// //     const bookings = await Booking.find({
// //       hostel: { $in: hostelIds },
// //       status: "pending",
// //       type: { $in: ["tour", "inspection"] },
// //     })
// //       .populate("hostel", "name")
// //       .populate("user", "name email phoneNumber")
// //       .select("type date status")
// //       .lean();

// //     res.json(bookings);
// //   } catch (err) {
// //     console.error("Error fetching pending bookings:", err);
// //     res.status(500).json({ error: "Server error", details: err.message });
// //   }
// // };

// // controllers/bookingController.js
// const Booking = require("../models/Booking");
// const Estate = require("../models/Estate");
// const Payment = require("../models/Payment");
// const Notification = require("../models/Notification");
// const Hostel = require("../models/Hostel");
// const User = require("../models/User");
// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// exports.createBooking = async (req, res, next) => {
//   try {
//     const { type, hostelId, date } = req.body;

//     // Validate booking type against schema enum
//     if (!["paynow", "virtual tour", "physical tour"].includes(type)) {
//       return res.status(400).json({ error: "Invalid booking type" });
//     }

//     const hostel = await Hostel.findById(hostelId).populate("estate");
//     if (!hostel) {
//       return res.status(404).json({ error: "Hostel not found" });
//     }

//     const booking = new Booking({
//       user: req.user.id,
//       hostel: hostelId,
//       type,
//       date,
//     });
//     await booking.save();

//     if (type !== "paynow") {
//       const user = await User.findById(req.user.id).select(
//         "name phoneNumber email"
//       );
//       const superagent = await User.findById(hostel.estate.superagent).select(
//         "email phoneNumber"
//       );

//       // Send notification to superagent
//       const notification = new Notification({
//         user: hostel.estate.superagent,
//         message: `New ${type} request for ${hostel.name} by ${user.name} (${user.email})`,
//       });
//       await notification.save();

//       // Send email to superagent
//       const mailOptions = {
//         from: process.env.EMAIL_USER,
//         to: superagent.email,
//         subject: `New ${type} Request for ${hostel.name}`,
//         text: `A new ${type} request has been made for ${hostel.name} by ${
//           user.name
//         }.\n\nContact Details:\nName: ${user.name}\nEmail: ${
//           user.email
//         }\nPhone: ${
//           user.phoneNumber || "Not provided"
//         }\n\nPlease confirm the booking in the dashboard.`,
//       };
//       await transporter.sendMail(mailOptions);
//       console.log("Email sent to superagent:", superagent.email);

//       // Log WhatsApp URL for superagent
//       if (superagent.phoneNumber) {
//         const message = encodeURIComponent(
//           `New ${type} request for ${hostel.name} by ${user.name}. Contact: ${
//             user.phoneNumber || user.email
//           }`
//         );
//         const whatsappUrl = `https://api.whatsapp.com/send?phone=${superagent.phoneNumber}&text=${message}`;
//         console.log("WhatsApp URL for superagent:", whatsappUrl);
//       }
//     }

//     res.status(201).json(booking);
//   } catch (err) {
//     console.error("Error creating booking:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// exports.confirmBooking = async (req, res, next) => {
//   try {
//     const { bookingId } = req.params;
//     const booking = await Booking.findById(bookingId).populate("hostel");

//     if (!booking) {
//       return res.status(404).json({ error: "Booking not found" });
//     }

//     if (!booking.hostel) {
//       return res
//         .status(404)
//         .json({ error: "Hostel not found for this booking" });
//     }

//     if (booking.type === "paynow") {
//       return res
//         .status(400)
//         .json({ error: "Paynow bookings are auto-confirmed after payment" });
//     }

//     const estate = await Estate.findOne({
//       _id: booking.hostel.estate,
//       superagent: req.user.id,
//     });
//     if (!estate && req.user.role !== "superagent") {
//       return res
//         .status(403)
//         .json({ error: "Not authorized to confirm this booking" });
//     }

//     booking.status = "confirmed";
//     await booking.save();

//     const notification = new Notification({
//       user: booking.user,
//       message: `Your ${booking.type} request for ${
//         booking.hostel.name
//       } has been confirmed for ${new Date(booking.date).toLocaleDateString()}.`,
//     });
//     await notification.save();

//     res.json({ message: "Booking confirmed", booking });
//   } catch (err) {
//     console.error("Error confirming booking:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// exports.confirmMultipleBookings = async (req, res, next) => {
//   try {
//     const { bookingIds } = req.body;
//     if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
//       return res.status(400).json({ error: "No booking IDs provided" });
//     }

//     const estateIds = await Estate.find({ superagent: req.user.id })
//       .select("_id")
//       .lean()
//       .then((estates) => estates.map((e) => e._id));
//     const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
//       .select("_id")
//       .lean()
//       .then((hostels) => hostels.map((h) => h._id));

//     const bookings = await Booking.find({
//       _id: { $in: bookingIds },
//       hostel: { $in: hostelIds },
//       status: "pending",
//       type: { $in: ["virtual tour", "physical tour"] },
//     }).populate("hostel user");

//     if (bookings.length === 0) {
//       return res.status(400).json({ error: "No valid bookings to confirm" });
//     }

//     await Booking.updateMany(
//       { _id: { $in: bookings.map((b) => b._id) } },
//       { status: "confirmed" }
//     );

//     for (const booking of bookings) {
//       const notification = new Notification({
//         user: booking.user,
//         message: `Your ${booking.type} request for ${
//           booking.hostel.name
//         } has been confirmed for ${new Date(
//           booking.date
//         ).toLocaleDateString()}.`,
//       });
//       await notification.save();
//     }

//     res.json({ message: "Selected bookings confirmed" });
//   } catch (err) {
//     console.error("Error confirming multiple bookings:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// exports.getBookings = async (req, res, next) => {
//   try {
//     const bookings = await Booking.find({ user: req.user.id })
//       .populate("hostel", "name price images")
//       .sort({ date: -1 });
//     res.json(bookings);
//   } catch (err) {
//     console.error("Error fetching bookings:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// exports.getPendingBookings = async (req, res, next) => {
//   try {
//     const estateIds = await Estate.find({ superagent: req.user.id })
//       .select("_id")
//       .lean()
//       .then((estates) => estates.map((e) => e._id));

//     const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
//       .select("_id")
//       .lean()
//       .then((hostels) => hostels.map((h) => h._id));

//     const bookings = await Booking.find({
//       hostel: { $in: hostelIds },
//       status: "pending",
//       type: { $in: ["virtual tour", "physical tour"] },
//     })
//       .populate("hostel", "name estate")
//       .populate("user", "name email phoneNumber")
//       .select("type date status hostel user createdAt")
//       .sort({ createdAt: -1 })
//       .lean();

//     // Ensure empty array is returned properly
//     res.json(bookings || []);
//   } catch (err) {
//     console.error("Error fetching pending bookings:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

// exports.getAllBookingsForSuperagent = async (req, res, next) => {
//   try {
//     const estateIds = await Estate.find({ superagent: req.user.id })
//       .select("_id")
//       .lean()
//       .then((estates) => estates.map((e) => e._id));

//     const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
//       .select("_id")
//       .lean()
//       .then((hostels) => hostels.map((h) => h._id));

//     const bookings = await Booking.find({
//       hostel: { $in: hostelIds },
//     })
//       .populate("hostel", "name estate")
//       .populate("user", "name email phoneNumber")
//       .select("type date status hostel user createdAt")
//       .sort({ createdAt: -1 })
//       .lean();

//     res.json(bookings || []);
//   } catch (err) {
//     console.error("Error fetching all bookings:", err);
//     res.status(500).json({ error: "Server error", details: err.message });
//   }
// };

const Booking = require("../models/Booking");
const Estate = require("../models/Estate");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const Hostel = require("../models/Hostel");
const User = require("../models/User");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.createBooking = async (req, res, next) => {
  try {
    const { type, hostelId, date } = req.body;

    // Validate booking type against schema enum
    if (!["paynow", "virtual tour", "physical tour"].includes(type)) {
      return res.status(400).json({ error: "Invalid booking type" });
    }

    const hostel = await Hostel.findById(hostelId).populate("estate");
    if (!hostel) {
      return res.status(404).json({ error: "Hostel not found" });
    }

    const booking = new Booking({
      user: req.user.id,
      hostel: hostelId,
      type,
      date,
    });
    await booking.save();

    if (type !== "paynow") {
      const user = await User.findById(req.user.id).select(
        "name phoneNumber email"
      );
      const superagent = await User.findById(hostel.estate.superagent).select(
        "email phoneNumber"
      );

      // Send notification to superagent
      const notification = new Notification({
        user: hostel.estate.superagent,
        message: `New ${type} request for ${hostel.name} by ${user.name} (${user.email})`,
      });
      await notification.save();

      // Send email to superagent
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: superagent.email,
        subject: `New ${type} Request for ${hostel.name}`,
        text: `A new ${type} request has been made for ${hostel.name} by ${
          user.name
        }.\n\nContact Details:\nName: ${user.name}\nEmail: ${
          user.email
        }\nPhone: ${
          user.phoneNumber || "Not provided"
        }\n\nPlease confirm the booking in the dashboard.`,
      };
      await transporter.sendMail(mailOptions);
      console.log("Email sent to superagent:", superagent.email);

      // Log WhatsApp URL for superagent
      if (superagent.phoneNumber) {
        const message = encodeURIComponent(
          `New ${type} request for ${hostel.name} by ${user.name}. Contact: ${
            user.phoneNumber || user.email
          }`
        );
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${superagent.phoneNumber}&text=${message}`;
        console.log("WhatsApp URL for superagent:", whatsappUrl);
      }
    }

    res.status(201).json(booking);
  } catch (err) {
    console.error("Error creating booking:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findById(bookingId).populate("hostel");

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    if (!booking.hostel) {
      return res
        .status(404)
        .json({ error: "Hostel not found for this booking" });
    }

    if (booking.type === "paynow") {
      return res
        .status(400)
        .json({ error: "Paynow bookings are auto-confirmed after payment" });
    }

    const estate = await Estate.findOne({
      _id: booking.hostel.estate,
      superagent: req.user.id,
    });
    if (!estate && req.user.role !== "superagent") {
      return res
        .status(403)
        .json({ error: "Not authorized to confirm this booking" });
    }

    booking.status = "confirmed";
    await booking.save();

    const notification = new Notification({
      user: booking.user,
      message: `Your ${booking.type} request for ${
        booking.hostel.name
      } has been confirmed for ${new Date(booking.date).toLocaleDateString()}.`,
    });
    await notification.save();

    res.json({ message: "Booking confirmed", booking });
  } catch (err) {
    console.error("Error confirming booking:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.confirmMultipleBookings = async (req, res, next) => {
  try {
    const { bookingIds } = req.body;
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({ error: "No booking IDs provided" });
    }

    const estateIds = await Estate.find({ superagent: req.user.id })
      .select("_id")
      .lean()
      .then((estates) => estates.map((e) => e._id));
    const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
      .select("_id")
      .lean()
      .then((hostels) => hostels.map((h) => h._id));

    const bookings = await Booking.find({
      _id: { $in: bookingIds },
      hostel: { $in: hostelIds },
      status: "pending",
      type: { $in: ["virtual tour", "physical tour"] },
    }).populate("hostel user");

    if (bookings.length === 0) {
      return res.status(400).json({ error: "No valid bookings to confirm" });
    }

    await Booking.updateMany(
      { _id: { $in: bookings.map((b) => b._id) } },
      { status: "confirmed" }
    );

    for (const booking of bookings) {
      const notification = new Notification({
        user: booking.user,
        message: `Your ${booking.type} request for ${
          booking.hostel.name
        } has been confirmed for ${new Date(
          booking.date
        ).toLocaleDateString()}.`,
      });
      await notification.save();
    }

    res.json({ message: "Selected bookings confirmed" });
  } catch (err) {
    console.error("Error confirming multiple bookings:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("hostel", "name price images")
      .sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getPendingBookings = async (req, res, next) => {
  try {
    const estateIds = await Estate.find({ superagent: req.user.id })
      .select("_id")
      .lean()
      .then((estates) => estates.map((e) => e._id));

    const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
      .select("_id")
      .lean()
      .then((hostels) => hostels.map((h) => h._id));

    const bookings = await Booking.find({
      hostel: { $in: hostelIds },
      status: "pending",
      type: { $in: ["virtual tour", "physical tour"] },
    })
      .populate("hostel", "name estate")
      .populate("user", "name email phoneNumber")
      .select("type date status hostel user createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Ensure empty array is returned properly
    res.json(bookings || []);
  } catch (err) {
    console.error("Error fetching pending bookings:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

exports.getAllBookingsForSuperagent = async (req, res, next) => {
  try {
    const estateIds = await Estate.find({ superagent: req.user.id })
      .select("_id")
      .lean()
      .then((estates) => estates.map((e) => e._id));

    const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
      .select("_id")
      .lean()
      .then((hostels) => hostels.map((h) => h._id));

    const bookings = await Booking.find({
      hostel: { $in: hostelIds },
    })
      .populate("hostel", "name estate")
      .populate("user", "name email phoneNumber")
      .select("type date status hostel user createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json(bookings || []);
  } catch (err) {
    console.error("Error fetching all bookings:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
};

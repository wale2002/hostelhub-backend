// const nodemailer = require("nodemailer");
// const {
//   initializePayment,
//   verifyPayment,
// } = require("../services/paystackService");
// const Payment = require("../models/Payment");
// const Booking = require("../models/Booking");
// const Hostel = require("../models/Hostel");
// const User = require("../models/User");
// const Notification = require("../models/Notification");

// // Set up Nodemailer transporter with Mailtrap
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
// });
// exports.initPayment = async (req, res, next) => {
//   try {
//     const { amount, email, bookingId } = req.body;
//     // Validate inputs
//     if (!amount || !email || !bookingId) {
//       return res
//         .status(400)
//         .json({ error: "Amount, email, and bookingId are required" });
//     }
//     if (isNaN(amount) || amount <= 0) {
//       return res
//         .status(400)
//         .json({ error: "Amount must be a positive number" });
//     }
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//       return res.status(400).json({ error: "Invalid email format" });
//     }

//     // Validate bookingId is a valid ObjectId
//     const mongoose = require("mongoose");
//     if (!mongoose.Types.ObjectId.isValid(bookingId)) {
//       return res.status(400).json({ error: "Invalid bookingId format" });
//     }

//     // Pass bookingId as metadata object
//     const paymentData = await initializePayment(amount, email, { bookingId });
//     console.log("Payment initialized:", paymentData);

//     // Create a pending Payment document
//     const payment = new Payment({
//       user: req.user.id, // Assuming req.user is set by auth middleware
//       booking: bookingId,
//       amount: amount, // Store in Naira
//       reference: paymentData.reference,
//       status: "pending",
//     });

//     // Save payment and handle potential errors
//     try {
//       await payment.save();
//       console.log("Saved payment:", payment);
//     } catch (saveError) {
//       console.error("Failed to save payment:", saveError.message);
//       return res.status(500).json({
//         error: "Failed to save payment record",
//         message: saveError.message,
//       });
//     }

//     res.json(paymentData);
//   } catch (err) {
//     console.error(
//       "Payment initialization error:",
//       err.message,
//       err.response?.data
//     );
//     res.status(400).json({
//       error: "Payment initialization failed",
//       message: err.message,
//     });
//   }
// };
// // Verify transporter configuration
// transporter.verify((error, success) => {
//   if (error) {
//     console.warn("Nodemailer configuration error:", error.message);
//   } else {
//     console.log("Nodemailer configured successfully for Mailtrap");
//   }
// });

// exports.verifyPayment = async (req, res, next) => {
//   try {
//     const { reference } = req.query;
//     if (!reference) {
//       return res.status(400).json({ error: "Reference is required" });
//     }

//     const result = await verifyPayment(reference);
//     console.log("Paystack verification response:", result);

//     if (!result || result.status !== "success") {
//       console.error("Verification failed condition:", { result });
//       return res.status(400).json({
//         error: "Payment verification failed",
//         details: result ? result.message : "No result data",
//       });
//     }

//     const payment = await Payment.findOne({ reference });
//     console.log("Found payment:", payment);

//     if (!payment) {
//       console.error("Payment not found for reference:", reference);
//       return res.status(404).json({ error: "Payment not found" });
//     }

//     const { metadata, amount } = result;
//     const bookingId = metadata?.bookingId;

//     if (!bookingId || payment.booking.toString() !== bookingId) {
//       console.error("Booking ID mismatch:", {
//         paymentBookingId: payment.booking.toString(),
//         metadataBookingId: bookingId,
//       });
//       return res.status(400).json({
//         error: "Invalid booking ID in payment metadata",
//         paymentBookingId: payment.booking.toString(),
//         metadataBookingId: bookingId,
//       });
//     }

//     payment.status = "success";
//     payment.amount = amount / 100;
//     await payment.save();
//     console.log("Updated payment:", payment);

//     const booking = await Booking.findById(bookingId).populate("hostel");
//     if (booking && booking.type === "paynow") {
//       booking.status = "confirmed";
//       await booking.save();
//       console.log("Auto-confirmed paynow booking:", booking);

//       // Fetch user, superagent, and landlord details
//       const user = await User.findById(booking.user).select(
//         "name phoneNumber email"
//       );
//       if (!user) {
//         console.error("User not found for booking:", booking.user);
//         return res.status(404).json({ error: "User not found" });
//       }

//       const hostel = await Hostel.findById(booking.hostel).populate("estate");
//       if (!hostel || !hostel.estate) {
//         console.error(
//           "Hostel or estate not found for booking:",
//           booking.hostel
//         );
//         return res.status(404).json({ error: "Hostel or estate not found" });
//       }

//       // Fetch superagent and landlord
//       const superagent = await User.findById(hostel.estate.superagent).select(
//         "email phoneNumber"
//       );
//       const landlord = await User.findById(hostel.estate.owner).select("email");

//       // Notify student
//       const studentNotification = new Notification({
//         user: booking.user,
//         message: `Your paynow booking for ${
//           booking.hostel.name
//         } has been confirmed for ${new Date(
//           booking.date
//         ).toLocaleDateString()}.`,
//       });
//       await studentNotification.save();
//       console.log("Student notification sent:", studentNotification);

//       // Check Nodemailer configuration
//       if (
//         !process.env.EMAIL_HOST ||
//         !process.env.EMAIL_PORT ||
//         !process.env.EMAIL_USERNAME ||
//         !process.env.EMAIL_PASSWORD ||
//         !process.env.EMAIL_FROM
//       ) {
//         console.warn(
//           "Nodemailer configuration missing, skipping email notifications. Missing:",
//           !process.env.EMAIL_HOST ? "EMAIL_HOST" : "",
//           !process.env.EMAIL_PORT ? "EMAIL_PORT" : "",
//           !process.env.EMAIL_USERNAME ? "EMAIL_USERNAME" : "",
//           !process.env.EMAIL_PASSWORD ? "EMAIL_PASSWORD" : "",
//           !process.env.EMAIL_FROM ? "EMAIL_FROM" : ""
//         );
//       } else {
//         // Send email to superagent (if found)
//         if (superagent && superagent.email) {
//           const superagentMailOptions = {
//             from: process.env.EMAIL_FROM, // estatehuboau@gmail.com
//             to: superagent.email,
//             subject: `New Paynow Booking Confirmed for ${booking.hostel.name}`,
//             text: `A paynow booking has been confirmed for ${
//               booking.hostel.name
//             } by ${user.name}.\n\nDetails:\nName: ${user.name}\nEmail: ${
//               user.email
//             }\nPhone: ${user.phoneNumber || "Not provided"}\nAmount: ₦${(
//               amount / 100
//             ).toLocaleString()}\nDate: ${new Date(
//               booking.date
//             ).toLocaleDateString()}\n\nPlease contact the student for further coordination.`,
//           };
//           try {
//             await transporter.sendMail(superagentMailOptions);
//             console.log("Email sent to superagent:", superagent.email);
//           } catch (emailError) {
//             console.warn("Failed to send superagent email:", {
//               message: emailError.message,
//               code: emailError.code,
//               stack: emailError.stack,
//             });
//             if (
//               emailError.code === "EAUTH" &&
//               emailError.message.includes("The email limit is reached")
//             ) {
//               console.warn(
//                 "Mailtrap email limit reached. Consider upgrading your plan or switching to another SMTP service."
//               );
//             }
//           }

//           // Log WhatsApp URL for superagent
//           if (superagent.phoneNumber) {
//             const message = encodeURIComponent(
//               `New paynow booking confirmed for ${booking.hostel.name} by ${
//                 user.name
//               }. Contact: ${user.phoneNumber || user.email}, Date: ${new Date(
//                 booking.date
//               ).toLocaleDateString()}, Amount: ₦${(
//                 amount / 100
//               ).toLocaleString()}`
//             );
//             const whatsappUrl = `https://api.whatsapp.com/send?phone=${superagent.phoneNumber}&text=${message}`;
//             console.log("WhatsApp URL for superagent:", whatsappUrl);
//           } else {
//             console.warn("Superagent phone number not found");
//           }
//         } else {
//           console.warn(
//             "Superagent not found or no email for estate:",
//             hostel.estate._id
//           );
//         }

//         // Send email to landlord (if found)
//         if (landlord && landlord.email) {
//           const landlordMailOptions = {
//             from: process.env.EMAIL_FROM, // estatehuboau@gmail.com
//             to: landlord.email,
//             subject: `Hostel ${booking.hostel.name} Successfully Booked`,
//             text: `Your hostel ${
//               booking.hostel.name
//             } has been successfully booked via a paynow booking by ${
//               user.name
//             }.\n\nStudent Details:\nName: ${user.name}\nEmail: ${
//               user.email
//             }\nPhone: ${user.phoneNumber || "Not provided"}\nAmount: ₦${(
//               amount / 100
//             ).toLocaleString()}\nDate: ${new Date(
//               booking.date
//             ).toLocaleDateString()}\n\nPlease contact the student for any further details.`,
//           };
//           try {
//             await transporter.sendMail(landlordMailOptions);
//             console.log("Email sent to landlord:", landlord.email);
//           } catch (emailError) {
//             console.warn("Failed to send landlord email:", {
//               message: emailError.message,
//               code: emailError.code,
//               stack: emailError.stack,
//             });
//             if (
//               emailError.code === "EAUTH" &&
//               emailError.message.includes("The email limit is reached")
//             ) {
//               console.warn(
//                 "Mailtrap email limit reached. Consider upgrading your plan or switching to another SMTP service."
//               );
//             }
//           }
//         } else {
//           console.warn(
//             "Landlord not found or no email for estate:",
//             hostel.estate._id
//           );
//         }
//       }
//     }

//     res.json({ success: true, data: result, payment });
//   } catch (err) {
//     console.error("Payment verification error:", err.message, err.stack);
//     res.status(400).json({
//       error: "Payment verification failed",
//       message: err.message,
//     });
//   }
// };

// controllers/paymentController.js
const nodemailer = require("nodemailer");
const {
  initializePayment,
  verifyPayment,
} = require("../services/paystackService");
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Hostel = require("../models/Hostel");
const User = require("../models/User");
const Notification = require("../models/Notification");

// Set up Nodemailer transporter with Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.warn("Nodemailer configuration error:", error.message);
  } else {
    console.log("Nodemailer configured successfully for Mailtrap");
  }
});

exports.initPayment = async (req, res, next) => {
  try {
    const { amount, email, bookingId } = req.body;

    // Validate inputs
    if (!amount || !email || !bookingId) {
      return res
        .status(400)
        .json({ error: "Amount, email, and bookingId are required" });
    }
    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Amount must be a positive number" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Validate bookingId is a valid ObjectId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid bookingId format" });
    }

    // Verify booking exists and belongs to the user
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (booking.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to pay for this booking" });
    }

    // Pass bookingId as metadata object
    const paymentData = await initializePayment(amount, email, { bookingId });
    console.log("Payment initialized:", paymentData);

    // Create a pending Payment document
    const payment = new Payment({
      user: req.user.id,
      booking: bookingId,
      amount: amount, // Store in Naira
      reference: paymentData.reference,
      status: "pending",
    });

    // Save payment
    await payment.save();
    console.log("Saved payment:", payment);

    res.json(paymentData);
  } catch (err) {
    console.error(
      "Payment initialization error:",
      err.message,
      err.response?.data
    );
    res.status(400).json({
      error: "Payment initialization failed",
      message: err.message,
    });
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    const result = await verifyPayment(reference);
    console.log("Paystack verification response:", result);

    if (!result || result.status !== "success") {
      console.error("Verification failed condition:", { result });
      return res.status(400).json({
        error: "Payment verification failed",
        details: result ? result.message : "No result data",
      });
    }

    const payment = await Payment.findOne({ reference });
    console.log("Found payment:", payment);

    if (!payment) {
      console.error("Payment not found for reference:", reference);
      return res.status(404).json({ error: "Payment not found" });
    }

    const { metadata, amount } = result;
    const bookingId = metadata?.bookingId;

    if (!bookingId || payment.booking.toString() !== bookingId) {
      console.error("Booking ID mismatch:", {
        paymentBookingId: payment.booking.toString(),
        metadataBookingId: bookingId,
      });
      return res.status(400).json({
        error: "Invalid booking ID in payment metadata",
        paymentBookingId: payment.booking.toString(),
        metadataBookingId: bookingId,
      });
    }

    payment.status = "success";
    payment.amount = amount / 100; // Convert to Naira
    await payment.save();
    console.log("Updated payment:", payment);

    const booking = await Booking.findById(bookingId).populate("hostel");
    if (!booking) {
      console.error("Booking not found:", bookingId);
      return res.status(404).json({ error: "Booking not found" });
    }

    if (booking.type === "paynow") {
      booking.status = "confirmed";
      await booking.save();
      console.log("Auto-confirmed paynow booking:", booking);
    }

    // Fetch user, superagent, and landlord details
    const user = await User.findById(booking.user).select(
      "name phoneNumber email"
    );
    if (!user) {
      console.error("User not found for booking:", booking.user);
      return res.status(404).json({ error: "User not found" });
    }

    const hostel = await Hostel.findById(booking.hostel).populate("estate");
    if (!hostel || !hostel.estate) {
      console.error("Hostel or estate not found for booking:", booking.hostel);
      return res.status(404).json({ error: "Hostel or estate not found" });
    }

    // Fetch superagent and landlord
    const superagent = await User.findById(hostel.estate.superagent).select(
      "email phoneNumber"
    );
    const landlord = await User.findById(hostel.owner).select("email"); // Use hostel.owner

    // Notify student
    const studentNotification = new Notification({
      user: booking.user,
      message: `Your paynow booking for ${
        booking.hostel.name
      } has been confirmed for ${new Date(
        booking.date
      ).toLocaleDateString()}. Payment of ₦${(
        amount / 100
      ).toLocaleString()} received.`,
      read: false,
    });
    await studentNotification.save();
    console.log("Student notification sent:", studentNotification);

    // Notify landlord
    const landlordNotification = new Notification({
      user: hostel.owner,
      message: `Payment of ₦${(
        amount / 100
      ).toLocaleString()} received for hostel "${booking.hostel.name}" by ${
        user.name
      } (Ref: ${reference}).`,
      read: false,
    });
    await landlordNotification.save();
    console.log("Landlord notification sent:", landlordNotification);

    // Check Nodemailer configuration
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USERNAME ||
      !process.env.EMAIL_PASSWORD ||
      !process.env.EMAIL_FROM
    ) {
      console.warn(
        "Nodemailer configuration missing, skipping email notifications. Missing:",
        !process.env.EMAIL_HOST ? "EMAIL_HOST" : "",
        !process.env.EMAIL_PORT ? "EMAIL_PORT" : "",
        !process.env.EMAIL_USERNAME ? "EMAIL_USERNAME" : "",
        !process.env.EMAIL_PASSWORD ? "EMAIL_PASSWORD" : "",
        !process.env.EMAIL_FROM ? "EMAIL_FROM" : ""
      );
    } else {
      // Send email to superagent (if found)
      if (superagent && superagent.email) {
        const superagentMailOptions = {
          from: process.env.EMAIL_FROM,
          to: superagent.email,
          subject: `New Paynow Booking Confirmed for ${booking.hostel.name}`,
          text: `A paynow booking has been confirmed for ${
            booking.hostel.name
          } by ${user.name}.\n\nDetails:\nName: ${user.name}\nEmail: ${
            user.email
          }\nPhone: ${user.phoneNumber || "Not provided"}\nAmount: ₦${(
            amount / 100
          ).toLocaleString()}\nDate: ${new Date(
            booking.date
          ).toLocaleDateString()}\n\nPlease contact the student for further coordination.`,
        };
        try {
          await transporter.sendMail(superagentMailOptions);
          console.log("Email sent to superagent:", superagent.email);
        } catch (emailError) {
          console.warn("Failed to send superagent email:", {
            message: emailError.message,
            code: emailError.code,
            stack: emailError.stack,
          });
          if (
            emailError.code === "EAUTH" &&
            emailError.message.includes("The email limit is reached")
          ) {
            console.warn(
              "Mailtrap email limit reached. Consider upgrading your plan or switching to another SMTP service."
            );
          }
        }

        // Log WhatsApp URL for superagent
        if (superagent.phoneNumber) {
          const message = encodeURIComponent(
            `New paynow booking confirmed for ${booking.hostel.name} by ${
              user.name
            }. Contact: ${user.phoneNumber || user.email}, Date: ${new Date(
              booking.date
            ).toLocaleDateString()}, Amount: ₦${(
              amount / 100
            ).toLocaleString()}`
          );
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${superagent.phoneNumber}&text=${message}`;
          console.log("WhatsApp URL for superagent:", whatsappUrl);
        } else {
          console.warn("Superagent phone number not found");
        }
      } else {
        console.warn(
          "Superagent not found or no email for estate:",
          hostel.estate._id
        );
      }

      // Send email to landlord (if found)
      if (landlord && landlord.email) {
        const landlordMailOptions = {
          from: process.env.EMAIL_FROM,
          to: landlord.email,
          subject: `Hostel ${booking.hostel.name} Successfully Booked`,
          text: `Your hostel ${
            booking.hostel.name
          } has been successfully booked via a paynow booking by ${
            user.name
          }.\n\nStudent Details:\nName: ${user.name}\nEmail: ${
            user.email
          }\nPhone: ${user.phoneNumber || "Not provided"}\nAmount: ₦${(
            amount / 100
          ).toLocaleString()}\nDate: ${new Date(
            booking.date
          ).toLocaleDateString()}\n\nPlease contact the student for any further details.`,
        };
        try {
          await transporter.sendMail(landlordMailOptions);
          console.log("Email sent to landlord:", landlord.email);
        } catch (emailError) {
          console.warn("Failed to send landlord email:", {
            message: emailError.message,
            code: emailError.code,
            stack: emailError.stack,
          });
          if (
            emailError.code === "EAUTH" &&
            emailError.message.includes("The email limit is reached")
          ) {
            console.warn(
              "Mailtrap email limit reached. Consider upgrading your plan or switching to another SMTP service."
            );
          }
        }
      } else {
        console.warn("Landlord not found or no email for hostel:", hostel._id);
      }
    }

    res.json({ success: true, data: result, payment });
  } catch (err) {
    console.error("Payment verification error:", err.message, err.stack);
    res.status(400).json({
      error: "Payment verification failed",
      message: err.message,
    });
  }
};

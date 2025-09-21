// // // // const Estate = require("../models/Estate");
// // // // const Hostel = require("../models/Hostel");
// // // // const Booking = require("../models/Booking");
// // // // const Notification = require("../models/Notification");
// // // // const Payment = require("../models/Payment");
// // // // const User = require("../models/User");

// // // // exports.getDashboard = async (req, res, next) => {
// // // //   try {
// // // //     let stats = {};
// // // //     console.log("User role:", req.user.role);

// // // //     if (req.user.role === "landlord") {
// // // //       // Get estate IDs for the landlord
// // // //       const estateIds = await Estate.find({ owner: req.user.id })
// // // //         .select("_id")
// // // //         .lean()
// // // //         .then((estates) => estates.map((e) => e._id));

// // // //       // Estates count
// // // //       stats.estates = estateIds.length;

// // // //       // Hostels count
// // // //       stats.hostels = await Hostel.countDocuments({
// // // //         estate: { $in: estateIds },
// // // //       });

// // // //       // Hostel IDs for filtering bookings and payments
// // // //       const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
// // // //         .select("_id")
// // // //         .lean()
// // // //         .then((hostels) => hostels.map((h) => h._id));

// // // //       // Booking status breakdown (includes "paynow", "virtual tour", "physical tour")
// // // //       const bookingStats = await Booking.aggregate([
// // // //         { $match: { hostel: { $in: hostelIds } } },
// // // //         {
// // // //           $group: {
// // // //             _id: { status: "$status", type: "$type" },
// // // //             count: { $sum: 1 },
// // // //           },
// // // //         },
// // // //         {
// // // //           $project: {
// // // //             status: "$_id.status",
// // // //             type: "$_id.type",
// // // //             count: 1,
// // // //             _id: 0,
// // // //           },
// // // //         },
// // // //       ]);
// // // //       stats.bookingStats = bookingStats;

// // // //       // Tenants (confirmed bookings with user and hostel details)
// // // //       const tenants = await Booking.find({
// // // //         hostel: { $in: hostelIds },
// // // //         status: "confirmed",
// // // //         type: "paynow", // Only paynow bookings are considered tenants
// // // //       })
// // // //         .populate("user", "name email phoneNumber")
// // // //         .populate("hostel", "name")
// // // //         .select("user hostel date status room lastPayment nextPayment")
// // // //         .lean();
// // // //       stats.tenants = tenants.map((booking) => ({
// // // //         _id: booking._id,
// // // //         tenant: booking.user?.name || "Unknown",
// // // //         email: booking.user?.email || "N/A",
// // // //         phoneNumber: booking.user?.phoneNumber || "N/A",
// // // //         room: booking.room || "N/A",
// // // //         lastPayment: booking.lastPayment
// // // //           ? new Date(booking.lastPayment).toISOString()
// // // //           : "N/A",
// // // //         nextPayment: booking.nextPayment
// // // //           ? new Date(booking.nextPayment).toISOString()
// // // //           : "N/A",
// // // //         hostel: booking.hostel?.name || "Unknown",
// // // //         status: booking.status,
// // // //       }));

// // // //       // Revenue and recent payments (only for "paynow" bookings)
// // // //       const revenueData = await Payment.aggregate([
// // // //         {
// // // //           $match: {
// // // //             booking: {
// // // //               $in: await Booking.find({
// // // //                 hostel: { $in: hostelIds },
// // // //                 status: "confirmed",
// // // //                 type: "paynow",
// // // //               }).select("_id"),
// // // //             },
// // // //             status: "success",
// // // //           },
// // // //         },
// // // //         {
// // // //           $lookup: {
// // // //             from: "bookings",
// // // //             localField: "booking",
// // // //             foreignField: "_id",
// // // //             as: "booking",
// // // //           },
// // // //         },
// // // //         { $unwind: "$booking" },
// // // //         {
// // // //           $lookup: {
// // // //             from: "users",
// // // //             localField: "booking.user",
// // // //             foreignField: "_id",
// // // //             as: "user",
// // // //           },
// // // //         },
// // // //         { $unwind: "$user" },
// // // //         {
// // // //           $group: {
// // // //             _id: null,
// // // //             totalRevenue: { $sum: "$amount" },
// // // //             recentPayments: {
// // // //               $push: {
// // // //                 _id: "$_id",
// // // //                 tenant: "$user.name",
// // // //                 amount: "$amount",
// // // //                 reference: "$reference",
// // // //                 createdAt: "$createdAt",
// // // //                 status: "$status",
// // // //               },
// // // //             },
// // // //           },
// // // //         },
// // // //         {
// // // //           $project: {
// // // //             totalRevenue: 1,
// // // //             recentPayments: { $slice: ["$recentPayments", 5] },
// // // //             _id: 0,
// // // //           },
// // // //         },
// // // //       ]);
// // // //       stats.revenue = revenueData[0]?.totalRevenue / 100 || 0; // Convert from kobo
// // // //       stats.recentPayments = revenueData[0]?.recentPayments || [];

// // // //       // Occupancy rates
// // // //       const hostels = await Hostel.find({ estate: { $in: estateIds } })
// // // //         .select("name rooms")
// // // //         .lean();
// // // //       stats.occupancy = await Promise.all(
// // // //         hostels.map(async (hostel) => {
// // // //           const bookedRooms = await Booking.countDocuments({
// // // //             hostel: hostel._id,
// // // //             status: "confirmed",
// // // //             type: "paynow",
// // // //             date: { $gte: new Date() },
// // // //           });
// // // //           return {
// // // //             name: hostel.name,
// // // //             occupancyRate: hostel.rooms
// // // //               ? (bookedRooms / hostel.rooms) * 100
// // // //               : 0,
// // // //             occupiedRooms: bookedRooms,
// // // //             totalRooms: hostel.rooms || 0,
// // // //           };
// // // //         })
// // // //       );

// // // //       // Notifications
// // // //       const notifications = await Notification.find({ user: req.user.id })
// // // //         .sort({ createdAt: -1 })
// // // //         .limit(5)
// // // //         .select("message read createdAt")
// // // //         .lean();
// // // //       stats.unreadNotifications = await Notification.countDocuments({
// // // //         user: req.user.id,
// // // //         read: false,
// // // //       });
// // // //       stats.recentNotifications = notifications;

// // // //       // Hostel performance
// // // //       const hostelPerformance = await Booking.aggregate([
// // // //         { $match: { hostel: { $in: hostelIds }, type: "paynow" } },
// // // //         {
// // // //           $lookup: {
// // // //             from: "payments",
// // // //             localField: "_id",
// // // //             foreignField: "booking",
// // // //             as: "payment",
// // // //           },
// // // //         },
// // // //         { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
// // // //         {
// // // //           $group: {
// // // //             _id: "$hostel",
// // // //             totalBookings: { $sum: 1 },
// // // //             totalRevenue: {
// // // //               $sum: {
// // // //                 $cond: [
// // // //                   { $eq: ["$payment.status", "success"] },
// // // //                   "$payment.amount",
// // // //                   0,
// // // //                 ],
// // // //               },
// // // //             },
// // // //           },
// // // //         },
// // // //         {
// // // //           $lookup: {
// // // //             from: "hostels",
// // // //             localField: "_id",
// // // //             foreignField: "_id",
// // // //             as: "hostel",
// // // //           },
// // // //         },
// // // //         { $unwind: "$hostel" },
// // // //         {
// // // //           $project: {
// // // //             name: "$hostel.name",
// // // //             totalBookings: 1,
// // // //             totalRevenue: { $divide: ["$totalRevenue", 100] },
// // // //             _id: 0,
// // // //           },
// // // //         },
// // // //       ]);
// // // //       stats.hostelPerformance = hostelPerformance;
// // // //     } else if (req.user.role === "superagent") {
// // // //       // Get estates managed by superagent
// // // //       const estateIds = await Estate.find({ superagent: req.user.id })
// // // //         .select("_id")
// // // //         .lean()
// // // //         .then((estates) => estates.map((e) => e._id));

// // // //       // Estates count
// // // //       stats.estates = estateIds.length;

// // // //       // Hostels count
// // // //       stats.hostels = await Hostel.countDocuments({
// // // //         estate: { $in: estateIds },
// // // //       });

// // // //       // Hostel IDs for filtering bookings
// // // //       const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
// // // //         .select("_id")
// // // //         .lean()
// // // //         .then((hostels) => hostels.map((h) => h._id));

// // // //       // Pending bookings for managed hostels (exclude paynow)
// // // //       stats.pendingBookings = await Booking.find({
// // // //         hostel: { $in: hostelIds },
// // // //         status: "pending",
// // // //         type: { $in: ["virtual tour", "physical tour"] },
// // // //       })
// // // //         .populate("hostel", "name")
// // // //         .populate("user", "name email phoneNumber")
// // // //         .select("type date hostel status user")
// // // //         .limit(5)
// // // //         .lean();

// // // //       // Payment status for managed bookings (only paynow)
// // // //       const paymentStatus = await Payment.aggregate([
// // // //         {
// // // //           $match: {
// // // //             booking: {
// // // //               $in: await Booking.find({
// // // //                 hostel: { $in: hostelIds },
// // // //                 type: "paynow",
// // // //               }).select("_id"),
// // // //             },
// // // //           },
// // // //         },
// // // //         {
// // // //           $group: {
// // // //             _id: "$status",
// // // //             count: { $sum: 1 },
// // // //             totalAmount: { $sum: "$amount" },
// // // //           },
// // // //         },
// // // //         {
// // // //           $project: {
// // // //             status: "$_id",
// // // //             count: 1,
// // // //             totalAmount: { $divide: ["$totalAmount", 100] },
// // // //             _id: 0,
// // // //           },
// // // //         },
// // // //       ]);
// // // //       stats.paymentStatus = paymentStatus;

// // // //       // Performance metrics
// // // //       const totalBookings = await Booking.countDocuments({
// // // //         hostel: { $in: hostelIds },
// // // //       });
// // // //       const confirmedBookings = await Booking.countDocuments({
// // // //         hostel: { $in: hostelIds },
// // // //         status: "confirmed",
// // // //       });
// // // //       stats.performance = {
// // // //         totalBookings,
// // // //         successRate: totalBookings
// // // //           ? (confirmedBookings / totalBookings) * 100
// // // //           : 0,
// // // //       };

// // // //       // Notifications
// // // //       const notifications = await Notification.find({ user: req.user.id })
// // // //         .sort({ createdAt: -1 })
// // // //         .limit(5)
// // // //         .select("message read createdAt")
// // // //         .lean();
// // // //       stats.unreadNotifications = await Notification.countDocuments({
// // // //         user: req.user.id,
// // // //         read: false,
// // // //       });
// // // //       stats.recentNotifications = notifications;
// // // //     } else if (req.user.role === "agent") {
// // // //       // Pending bookings
// // // //       stats.pendingBookings = await Booking.find({
// // // //         user: req.user.id,
// // // //         status: "pending",
// // // //       })
// // // //         .populate("hostel", "name")
// // // //         .select("type date hostel status")
// // // //         .limit(5)
// // // //         .lean();

// // // //       // Client activity
// // // //       stats.clients = await Booking.aggregate([
// // // //         { $match: { user: req.user.id, status: "confirmed" } },
// // // //         {
// // // //           $group: {
// // // //             _id: "$user",
// // // //             lastBooking: { $max: "$date" },
// // // //             totalBookings: { $sum: 1 },
// // // //           },
// // // //         },
// // // //         {
// // // //           $lookup: {
// // // //             from: "users",
// // // //             localField: "_id",
// // // //             foreignField: "_id",
// // // //             as: "user",
// // // //           },
// // // //         },
// // // //         { $unwind: "$user" },
// // // //         {
// // // //           $project: {
// // // //             email: "$user.email",
// // // //             lastBooking: 1,
// // // //             totalBookings: 1,
// // // //             _id: 0,
// // // //           },
// // // //         },
// // // //         { $limit: 5 },
// // // //       ]);

// // // //       // Payment status
// // // //       const paymentStatus = await Payment.aggregate([
// // // //         {
// // // //           $match: {
// // // //             booking: {
// // // //               $in: await Booking.find({ user: req.user.id }).select("_id"),
// // // //             },
// // // //           },
// // // //         },
// // // //         {
// // // //           $group: {
// // // //             _id: "$status",
// // // //             count: { $sum: 1 },
// // // //             totalAmount: { $sum: "$amount" },
// // // //           },
// // // //         },
// // // //         {
// // // //           $project: {
// // // //             status: "$_id",
// // // //             count: 1,
// // // //             totalAmount: { $divide: ["$totalAmount", 100] },
// // // //             _id: 0,
// // // //           },
// // // //         },
// // // //       ]);
// // // //       stats.paymentStatus = paymentStatus;

// // // //       // Performance metrics
// // // //       const totalBookings = await Booking.countDocuments({ user: req.user.id });
// // // //       const confirmedBookings = await Booking.countDocuments({
// // // //         user: req.user.id,
// // // //         status: "confirmed",
// // // //       });
// // // //       stats.performance = {
// // // //         totalBookings,
// // // //         successRate: totalBookings
// // // //           ? (confirmedBookings / totalBookings) * 100
// // // //           : 0,
// // // //       };

// // // //       // Notifications
// // // //       const notifications = await Notification.find({ user: req.user.id })
// // // //         .sort({ createdAt: -1 })
// // // //         .limit(5)
// // // //         .select("message read createdAt")
// // // //         .lean();
// // // //       stats.unreadNotifications = await Notification.countDocuments({
// // // //         user: req.user.id,
// // // //         read: false,
// // // //       });
// // // //       stats.recentNotifications = notifications;
// // // //     } else if (req.user.role === "student") {
// // // //       stats.bookings = await Booking.countDocuments({ user: req.user.id });

// // // //       // Upcoming bookings
// // // //       stats.upcomingBookings = await Booking.find({
// // // //         user: req.user.id,
// // // //         date: { $gte: new Date() },
// // // //       })
// // // //         .populate("hostel", "name images price")
// // // //         .sort({ date: 1 })
// // // //         .limit(5)
// // // //         .lean();

// // // //       // Recommendations (exclude hostels with null estates)
// // // //       const pastHostelIds = await Booking.find({ user: req.user.id }).distinct(
// // // //         "hostel"
// // // //       );
// // // //       stats.recommendations = await Hostel.find({
// // // //         _id: { $nin: pastHostelIds },
// // // //         price: { $lte: 50000 },
// // // //         estate: { $ne: null, $exists: true },
// // // //       })
// // // //         .populate("estate", "location")
// // // //         .limit(5)
// // // //         .lean();

// // // //       // Payment history
// // // //       stats.payments = await Payment.find({ user: req.user.id })
// // // //         .sort({ createdAt: -1 })
// // // //         .limit(5)
// // // //         .lean();

// // // //       // Notifications
// // // //       const notifications = await Notification.find({ user: req.user.id })
// // // //         .sort({ createdAt: -1 })
// // // //         .limit(5)
// // // //         .lean();
// // // //       stats.unreadNotifications = await Notification.countDocuments({
// // // //         user: req.user.id,
// // // //         read: false,
// // // //       });
// // // //       stats.recentNotifications = notifications;
// // // //     } else {
// // // //       stats.message = "Role not recognized";
// // // //     }

// // // //     console.log("Stats:", stats);
// // // //     res.json(stats);
// // // //   } catch (err) {
// // // //     console.error("Error fetching dashboard data:", err);
// // // //     res.status(500).json({ error: "Server error", details: err.message });
// // // //   }
// // // // };

// // // const Hostel = require("../models/Hostel");
// // // const Booking = require("../models/Booking");
// // // const Notification = require("../models/Notification");
// // // const Payment = require("../models/Payment");
// // // const User = require("../models/User");
// // // const Estate = require("../models/Estate");
// // // exports.getDashboard = async (req, res, next) => {
// // //   try {
// // //     let stats = {};
// // //     console.log("User role:", req.user.role);
// // //     if (req.user.role === "landlord") {
// // //       // Directly get hostel IDs owned by the landlord
// // //       const hostelIds = await Hostel.find({ owner: req.user.id })
// // //         .select("_id")
// // //         .lean()
// // //         .then((hostels) => hostels.map((h) => h._id));

// // //       // Hostels count
// // //       stats.hostels = hostelIds.length;

// // //       // Booking status breakdown
// // //       const bookingStats = await Booking.aggregate([
// // //         { $match: { hostel: { $in: hostelIds } } },
// // //         {
// // //           $group: {
// // //             _id: { status: "$status", type: "$type" },
// // //             count: { $sum: 1 },
// // //           },
// // //         },
// // //         {
// // //           $project: {
// // //             status: "$_id.status",
// // //             type: "$_id.type",
// // //             count: 1,
// // //             _id: 0,
// // //           },
// // //         },
// // //       ]);
// // //       stats.bookingStats = bookingStats;

// // //       // Tenants (confirmed paynow bookings)
// // //       const tenants = await Booking.find({
// // //         hostel: { $in: hostelIds },
// // //         status: "confirmed",
// // //         type: "paynow",
// // //       })
// // //         .populate("user", "name email phoneNumber")
// // //         .populate("hostel", "name")
// // //         .select("user hostel date status room")
// // //         .lean();
// // //       stats.tenants = tenants.map((booking) => ({
// // //         _id: booking._id,
// // //         tenant: booking.user?.name || "Unknown",
// // //         email: booking.user?.email || "N/A",
// // //         phoneNumber: booking.user?.phoneNumber || "N/A",
// // //         room: booking.room || "N/A",
// // //         hostel: booking.hostel?.name || "Unknown",
// // //         status: booking.status,
// // //       }));

// // //       // Revenue and recent payments
// // //       const revenueData = await Payment.aggregate([
// // //         {
// // //           $match: {
// // //             booking: {
// // //               $in: await Booking.find({
// // //                 hostel: { $in: hostelIds },
// // //                 status: "confirmed",
// // //                 type: "paynow",
// // //               }).select("_id"),
// // //             },
// // //             status: "success",
// // //           },
// // //         },
// // //         {
// // //           $lookup: {
// // //             from: "bookings",
// // //             localField: "booking",
// // //             foreignField: "_id",
// // //             as: "booking",
// // //           },
// // //         },
// // //         { $unwind: "$booking" },
// // //         {
// // //           $lookup: {
// // //             from: "users",
// // //             localField: "booking.user",
// // //             foreignField: "_id",
// // //             as: "user",
// // //           },
// // //         },
// // //         { $unwind: "$user" },
// // //         {
// // //           $group: {
// // //             _id: null,
// // //             totalRevenue: { $sum: "$amount" },
// // //             recentPayments: {
// // //               $push: {
// // //                 _id: "$_id",
// // //                 tenant: "$user.name",
// // //                 amount: "$amount",
// // //                 reference: "$reference",
// // //                 createdAt: "$createdAt",
// // //                 status: "$status",
// // //               },
// // //             },
// // //           },
// // //         },
// // //         {
// // //           $project: {
// // //             totalRevenue: 1,
// // //             recentPayments: { $slice: ["$recentPayments", 5] },
// // //             _id: 0,
// // //           },
// // //         },
// // //       ]);
// // //       stats.revenue = revenueData[0]?.totalRevenue / 100 || 0;
// // //       stats.recentPayments = revenueData[0]?.recentPayments || [];

// // //       // Occupancy rates
// // //       const hostels = await Hostel.find({ owner: req.user.id })
// // //         .select("name rooms")
// // //         .lean();
// // //       stats.occupancy = await Promise.all(
// // //         hostels.map(async (hostel) => {
// // //           const bookedRooms = await Booking.countDocuments({
// // //             hostel: hostel._id,
// // //             status: "confirmed",
// // //             type: "paynow",
// // //             date: { $gte: new Date() },
// // //           });
// // //           return {
// // //             name: hostel.name,
// // //             occupancyRate: hostel.rooms
// // //               ? (bookedRooms / hostel.rooms) * 100
// // //               : 0,
// // //             occupiedRooms: bookedRooms,
// // //             totalRooms: hostel.rooms || 0,
// // //           };
// // //         })
// // //       );

// // //       // Notifications
// // //       const notifications = await Notification.find({ user: req.user.id })
// // //         .sort({ createdAt: -1 })
// // //         .limit(5)
// // //         .select("message read createdAt")
// // //         .lean();
// // //       stats.unreadNotifications = await Notification.countDocuments({
// // //         user: req.user.id,
// // //         read: false,
// // //       });
// // //       stats.recentNotifications = notifications;

// // //       // Hostel performance
// // //       const hostelPerformance = await Booking.aggregate([
// // //         { $match: { hostel: { $in: hostelIds }, type: "paynow" } },
// // //         {
// // //           $lookup: {
// // //             from: "payments",
// // //             localField: "_id",
// // //             foreignField: "booking",
// // //             as: "payment",
// // //           },
// // //         },
// // //         { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
// // //         {
// // //           $group: {
// // //             _id: "$hostel",
// // //             totalBookings: { $sum: 1 },
// // //             totalRevenue: {
// // //               $sum: {
// // //                 $cond: [
// // //                   { $eq: ["$payment.status", "success"] },
// // //                   "$payment.amount",
// // //                   0,
// // //                 ],
// // //               },
// // //             },
// // //           },
// // //         },
// // //         {
// // //           $lookup: {
// // //             from: "hostels",
// // //             localField: "_id",
// // //             foreignField: "_id",
// // //             as: "hostel",
// // //           },
// // //         },
// // //         { $unwind: "$hostel" },
// // //         {
// // //           $project: {
// // //             name: "$hostel.name",
// // //             totalBookings: 1,
// // //             totalRevenue: { $divide: ["$totalRevenue", 100] },
// // //             _id: 0,
// // //           },
// // //         },
// // //       ]);
// // //       stats.hostelPerformance = hostelPerformance;
// // //     } else if (req.user.role === "superagent") {
// // //       // Get estates managed by superagent
// // //       const estateIds = await Estate.find({ superagent: req.user.id })
// // //         .select("_id")
// // //         .lean()
// // //         .then((estates) => estates.map((e) => e._id));

// // //       stats.estates = estateIds.length;

// // //       stats.hostels = await Hostel.countDocuments({
// // //         estate: { $in: estateIds },
// // //       });

// // //       const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
// // //         .select("_id")
// // //         .lean()
// // //         .then((hostels) => hostels.map((h) => h._id));

// // //       stats.pendingBookings = await Booking.find({
// // //         hostel: { $in: hostelIds },
// // //         status: "pending",
// // //         type: { $in: ["virtual tour", "physical tour"] },
// // //       })
// // //         .populate("hostel", "name")
// // //         .populate("user", "name email phoneNumber")
// // //         .select("type date hostel status user")
// // //         .limit(5)
// // //         .lean();

// // //       const paymentStatus = await Payment.aggregate([
// // //         {
// // //           $match: {
// // //             booking: {
// // //               $in: await Booking.find({
// // //                 hostel: { $in: hostelIds },
// // //                 type: "paynow",
// // //               }).select("_id"),
// // //             },
// // //           },
// // //         },
// // //         {
// // //           $group: {
// // //             _id: "$status",
// // //             count: { $sum: 1 },
// // //             totalAmount: { $sum: "$amount" },
// // //           },
// // //         },
// // //         {
// // //           $project: {
// // //             status: "$_id",
// // //             count: 1,
// // //             totalAmount: { $divide: ["$totalAmount", 100] },
// // //             _id: 0,
// // //           },
// // //         },
// // //       ]);
// // //       stats.paymentStatus = paymentStatus;

// // //       const totalBookings = await Booking.countDocuments({
// // //         hostel: { $in: hostelIds },
// // //       });
// // //       const confirmedBookings = await Booking.countDocuments({
// // //         hostel: { $in: hostelIds },
// // //         status: "confirmed",
// // //       });
// // //       stats.performance = {
// // //         totalBookings,
// // //         successRate: totalBookings
// // //           ? (confirmedBookings / totalBookings) * 100
// // //           : 0,
// // //       };

// // //       const notifications = await Notification.find({ user: req.user.id })
// // //         .sort({ createdAt: -1 })
// // //         .limit(5)
// // //         .select("message read createdAt")
// // //         .lean();
// // //       stats.unreadNotifications = await Notification.countDocuments({
// // //         user: req.user.id,
// // //         read: false,
// // //       });
// // //       stats.recentNotifications = notifications;
// // //     } else if (req.user.role === "student") {
// // //       stats.bookings = await Booking.countDocuments({ user: req.user.id });

// // //       stats.upcomingBookings = await Booking.find({
// // //         user: req.user.id,
// // //         date: { $gte: new Date() },
// // //       })
// // //         .populate("hostel", "name images price")
// // //         .sort({ date: 1 })
// // //         .limit(5)
// // //         .lean();

// // //       const pastHostelIds = await Booking.find({ user: req.user.id }).distinct(
// // //         "hostel"
// // //       );
// // //       stats.recommendations = await Hostel.find({
// // //         _id: { $nin: pastHostelIds },
// // //         price: { $lte: 50000 },
// // //         estate: { $ne: null, $exists: true },
// // //       })
// // //         .populate("estate", "location")
// // //         .limit(5)
// // //         .lean();

// // //       stats.payments = await Payment.find({ user: req.user.id })
// // //         .sort({ createdAt: -1 })
// // //         .limit(5)
// // //         .lean();

// // //       const notifications = await Notification.find({ user: req.user.id })
// // //         .sort({ createdAt: -1 })
// // //         .limit(5)
// // //         .lean();
// // //       stats.unreadNotifications = await Notification.countDocuments({
// // //         user: req.user.id,
// // //         read: false,
// // //       });
// // //       stats.recentNotifications = notifications;
// // //     } else {
// // //       stats.message = "Role not recognized";
// // //     }

// // //     console.log("Stats:", stats);
// // //     res.json(stats);
// // //   } catch (err) {
// // //     console.error("Error fetching dashboard data:", err);
// // //     res.status(500).json({ error: "Server error", details: err.message });
// // //   }
// // // };

// // // controllers/dashboardController.js (assuming the file name based on context)
// // const Hostel = require("../models/Hostel");
// // const Booking = require("../models/Booking");
// // const Notification = require("../models/Notification");
// // const Payment = require("../models/Payment");
// // const User = require("../models/User");
// // const Estate = require("../models/Estate");

// // exports.getDashboard = async (req, res, next) => {
// //   try {
// //     let stats = {};
// //     console.log("User role:", req.user.role);
// //     if (req.user.role === "landlord") {
// //       // Directly get hostel IDs owned by the landlord
// //       const hostelIds = await Hostel.find({ owner: req.user.id })
// //         .select("_id")
// //         .lean()
// //         .then((hostels) => hostels.map((h) => h._id));

// //       // Hostels count
// //       stats.hostels = hostelIds.length;

// //       // Booking status breakdown
// //       const bookingStats = await Booking.aggregate([
// //         { $match: { hostel: { $in: hostelIds } } },
// //         {
// //           $group: {
// //             _id: { status: "$status", type: "$type" },
// //             count: { $sum: 1 },
// //           },
// //         },
// //         {
// //           $project: {
// //             status: "$_id.status",
// //             type: "$_id.type",
// //             count: 1,
// //             _id: 0,
// //           },
// //         },
// //       ]);
// //       stats.bookingStats = bookingStats;

// //       // Tenants (confirmed paynow bookings)
// //       const tenants = await Booking.find({
// //         hostel: { $in: hostelIds },
// //         status: "confirmed",
// //         type: "paynow",
// //       })
// //         .populate("user", "name email phoneNumber")
// //         .populate("hostel", "name")
// //         .select("user hostel date status room")
// //         .lean();
// //       stats.tenants = tenants.map((booking) => ({
// //         _id: booking._id,
// //         tenant: booking.user?.name || "Unknown",
// //         email: booking.user?.email || "N/A",
// //         phoneNumber: booking.user?.phoneNumber || "N/A",
// //         room: booking.room || "N/A",
// //         hostel: booking.hostel?.name || "Unknown",
// //         status: booking.status,
// //       }));

// //       // Revenue and recent payments
// //       const revenueData = await Payment.aggregate([
// //         {
// //           $match: {
// //             booking: {
// //               $in: await Booking.find({
// //                 hostel: { $in: hostelIds },
// //                 status: "confirmed",
// //                 type: "paynow",
// //               }).select("_id"),
// //             },
// //             status: "success",
// //           },
// //         },
// //         {
// //           $lookup: {
// //             from: "bookings",
// //             localField: "booking",
// //             foreignField: "_id",
// //             as: "booking",
// //           },
// //         },
// //         { $unwind: "$booking" },
// //         {
// //           $lookup: {
// //             from: "users",
// //             localField: "booking.user",
// //             foreignField: "_id",
// //             as: "user",
// //           },
// //         },
// //         { $unwind: "$user" },
// //         {
// //           $group: {
// //             _id: null,
// //             totalRevenue: { $sum: "$amount" },
// //             recentPayments: {
// //               $push: {
// //                 _id: "$_id",
// //                 tenant: "$user.name",
// //                 amount: "$amount",
// //                 reference: "$reference",
// //                 createdAt: "$createdAt",
// //                 status: "$status",
// //               },
// //             },
// //           },
// //         },
// //         {
// //           $project: {
// //             totalRevenue: 1,
// //             recentPayments: { $slice: ["$recentPayments", 5] },
// //             _id: 0,
// //           },
// //         },
// //       ]);
// //       stats.revenue = revenueData[0]?.totalRevenue / 100 || 0;
// //       stats.recentPayments = revenueData[0]?.recentPayments || [];

// //       // Occupancy rates
// //       const hostels = await Hostel.find({ owner: req.user.id })
// //         .select("name rooms")
// //         .lean();
// //       stats.occupancy = await Promise.all(
// //         hostels.map(async (hostel) => {
// //           const bookedRooms = await Booking.countDocuments({
// //             hostel: hostel._id,
// //             status: "confirmed",
// //             type: "paynow",
// //             date: { $gte: new Date() },
// //           });
// //           return {
// //             name: hostel.name,
// //             occupancyRate: hostel.rooms
// //               ? (bookedRooms / hostel.rooms) * 100
// //               : 0,
// //             occupiedRooms: bookedRooms,
// //             totalRooms: hostel.rooms || 0,
// //           };
// //         })
// //       );

// //       // Notifications
// //       const notifications = await Notification.find({ user: req.user.id })
// //         .sort({ createdAt: -1 })
// //         .limit(5)
// //         .select("message read createdAt")
// //         .lean();
// //       stats.unreadNotifications = await Notification.countDocuments({
// //         user: req.user.id,
// //         read: false,
// //       });
// //       stats.recentNotifications = notifications;

// //       // Hostel performance
// //       const hostelPerformance = await Booking.aggregate([
// //         { $match: { hostel: { $in: hostelIds }, type: "paynow" } },
// //         {
// //           $lookup: {
// //             from: "payments",
// //             localField: "_id",
// //             foreignField: "booking",
// //             as: "payment",
// //           },
// //         },
// //         { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
// //         {
// //           $group: {
// //             _id: "$hostel",
// //             totalBookings: { $sum: 1 },
// //             totalRevenue: {
// //               $sum: {
// //                 $cond: [
// //                   { $eq: ["$payment.status", "success"] },
// //                   "$payment.amount",
// //                   0,
// //                 ],
// //               },
// //             },
// //           },
// //         },
// //         {
// //           $lookup: {
// //             from: "hostels",
// //             localField: "_id",
// //             foreignField: "_id",
// //             as: "hostel",
// //           },
// //         },
// //         { $unwind: "$hostel" },
// //         {
// //           $project: {
// //             name: "$hostel.name",
// //             totalBookings: 1,
// //             totalRevenue: { $divide: ["$totalRevenue", 100] },
// //             _id: 0,
// //           },
// //         },
// //       ]);
// //       stats.hostelPerformance = hostelPerformance;
// //     } else if (req.user.role === "superagent") {
// //       // Get estates managed by superagent
// //       const estateIds = await Estate.find({ superagent: req.user.id })
// //         .select("_id")
// //         .lean()
// //         .then((estates) => estates.map((e) => e._id));

// //       stats.estates = estateIds.length;

// //       stats.hostels = await Hostel.countDocuments({
// //         estate: { $in: estateIds },
// //       });

// //       const hostelIds = await Hostel.find({ estate: { $in: estateIds } })
// //         .select("_id")
// //         .lean()
// //         .then((hostels) => hostels.map((h) => h._id));

// //       stats.pendingBookings = await Booking.find({
// //         hostel: { $in: hostelIds },
// //         status: "pending",
// //         type: { $in: ["tour", "inspection"] },
// //       })
// //         .populate("hostel", "name")
// //         .populate("user", "name email phoneNumber")
// //         .select("type date hostel status user")
// //         .lean();

// //       const paymentStatus = await Payment.aggregate([
// //         {
// //           $match: {
// //             booking: {
// //               $in: await Booking.find({
// //                 hostel: { $in: hostelIds },
// //                 type: "paynow",
// //               }).select("_id"),
// //             },
// //           },
// //         },
// //         {
// //           $group: {
// //             _id: "$status",
// //             count: { $sum: 1 },
// //             totalAmount: { $sum: "$amount" },
// //           },
// //         },
// //         {
// //           $project: {
// //             status: "$_id",
// //             count: 1,
// //             totalAmount: { $divide: ["$totalAmount", 100] },
// //             _id: 0,
// //           },
// //         },
// //       ]);
// //       stats.paymentStatus = paymentStatus;

// //       const totalBookings = await Booking.countDocuments({
// //         hostel: { $in: hostelIds },
// //       });
// //       const confirmedBookings = await Booking.countDocuments({
// //         hostel: { $in: hostelIds },
// //         status: "confirmed",
// //       });
// //       stats.performance = {
// //         totalBookings,
// //         successRate: totalBookings
// //           ? (confirmedBookings / totalBookings) * 100
// //           : 0,
// //       };

// //       const notifications = await Notification.find({ user: req.user.id })
// //         .sort({ createdAt: -1 })
// //         .limit(5)
// //         .select("message read createdAt")
// //         .lean();
// //       stats.unreadNotifications = await Notification.countDocuments({
// //         user: req.user.id,
// //         read: false,
// //       });
// //       stats.recentNotifications = notifications;
// //     } else if (req.user.role === "student") {
// //       stats.bookings = await Booking.countDocuments({ user: req.user.id });

// //       stats.upcomingBookings = await Booking.find({
// //         user: req.user.id,
// //         date: { $gte: new Date() },
// //       })
// //         .populate("hostel", "name images price")
// //         .sort({ date: 1 })
// //         .limit(5)
// //         .lean();

// //       const pastHostelIds = await Booking.find({ user: req.user.id }).distinct(
// //         "hostel"
// //       );
// //       stats.recommendations = await Hostel.find({
// //         _id: { $nin: pastHostelIds },
// //         price: { $lte: 50000 },
// //         estate: { $ne: null, $exists: true },
// //       })
// //         .populate("estate", "location")
// //         .limit(5)
// //         .lean();

// //       stats.payments = await Payment.find({ user: req.user.id })
// //         .sort({ createdAt: -1 })
// //         .limit(5)
// //         .lean();

// //       const notifications = await Notification.find({ user: req.user.id })
// //         .sort({ createdAt: -1 })
// //         .limit(5)
// //         .lean();
// //       stats.unreadNotifications = await Notification.countDocuments({
// //         user: req.user.id,
// //         read: false,
// //       });
// //       stats.recentNotifications = notifications;
// //     } else {
// //       stats.message = "Role not recognized";
// //     }

// //     console.log("Stats:", stats);
// //     res.json(stats);
// //   } catch (err) {
// //     console.error("Error fetching dashboard data:", err);
// //     res.status(500).json({ error: "Server error", details: err.message });
// //   }
// // };

// // controllers/dashboardController.js
// const Hostel = require("../models/Hostel");
// const Booking = require("../models/Booking");
// const Notification = require("../models/Notification");
// const Payment = require("../models/Payment");
// const User = require("../models/User");
// const Estate = require("../models/Estate");

// exports.getDashboard = async (req, res, next) => {
//   try {
//     let stats = {};
//     console.log("User role:", req.user.role);

//     if (req.user.role === "landlord") {
//       // Directly get hostel IDs owned by the landlord
//       const hostelIds = await Hostel.find({ owner: req.user.id })
//         .select("_id")
//         .lean()
//         .then((hostels) => hostels.map((h) => h._id));

//       // Hostels count
//       stats.hostels = hostelIds.length;

//       // Booking status breakdown
//       const bookingStats = await Booking.aggregate([
//         { $match: { hostel: { $in: hostelIds } } },
//         {
//           $group: {
//             _id: { status: "$status", type: "$type" },
//             count: { $sum: 1 },
//           },
//         },
//         {
//           $project: {
//             status: "$_id.status",
//             type: "$_id.type",
//             count: 1,
//             _id: 0,
//           },
//         },
//       ]);
//       stats.bookingStats = bookingStats || [];

//       // Tenants (confirmed paynow bookings)
//       const tenants = await Booking.find({
//         hostel: { $in: hostelIds },
//         status: "confirmed",
//         type: "paynow",
//       })
//         .populate("user", "name email phoneNumber")
//         .populate("hostel", "name")
//         .select("user hostel date status room")
//         .lean();

//       stats.tenants =
//         tenants.map((booking) => ({
//           _id: booking._id,
//           tenant: booking.user?.name || "Unknown",
//           email: booking.user?.email || "N/A",
//           phoneNumber: booking.user?.phoneNumber || "N/A",
//           room: booking.room || "N/A",
//           hostel: booking.hostel?.name || "Unknown",
//           status: booking.status,
//           moveInDate: booking.date,
//         })) || [];

//       // Revenue and recent payments
//       const revenueData = await Payment.aggregate([
//         {
//           $match: {
//             booking: {
//               $in: await Booking.find({
//                 hostel: { $in: hostelIds },
//                 status: "confirmed",
//                 type: "paynow",
//               }).select("_id"),
//             },
//             status: "success",
//           },
//         },
//         {
//           $lookup: {
//             from: "bookings",
//             localField: "booking",
//             foreignField: "_id",
//             as: "booking",
//           },
//         },
//         { $unwind: "$booking" },
//         {
//           $lookup: {
//             from: "users",
//             localField: "booking.user",
//             foreignField: "_id",
//             as: "user",
//           },
//         },
//         { $unwind: "$user" },
//         {
//           $group: {
//             _id: null,
//             totalRevenue: { $sum: "$amount" },
//             recentPayments: {
//               $push: {
//                 _id: "$_id",
//                 tenant: "$user.name",
//                 amount: "$amount",
//                 reference: "$reference",
//                 createdAt: "$createdAt",
//                 status: "$status",
//                 hostel: "$booking.hostel",
//               },
//             },
//           },
//         },
//         {
//           $project: {
//             totalRevenue: 1,
//             recentPayments: { $slice: ["$recentPayments", 5] },
//             _id: 0,
//           },
//         },
//       ]);
//       stats.revenue = revenueData[0]?.totalRevenue / 100 || 0;
//       stats.recentPayments = revenueData[0]?.recentPayments || [];

//       // Occupancy rates
//       const hostels = await Hostel.find({ owner: req.user.id })
//         .select("name rooms price location")
//         .lean();

//       stats.occupancy =
//         (await Promise.all(
//           hostels.map(async (hostel) => {
//             const bookedRooms = await Booking.countDocuments({
//               hostel: hostel._id,
//               status: "confirmed",
//               type: "paynow",
//               date: { $gte: new Date() },
//             });
//             return {
//               _id: hostel._id,
//               name: hostel.name,
//               occupancyRate: hostel.rooms
//                 ? Math.round((bookedRooms / hostel.rooms) * 100)
//                 : 0,
//               occupiedRooms: bookedRooms,
//               totalRooms: hostel.rooms || 0,
//               availableRooms: hostel.rooms ? hostel.rooms - bookedRooms : 0,
//               price: hostel.price,
//               location: hostel.location || "N/A",
//             };
//           })
//         )) || [];

//       // Tour bookings (virtual and physical)
//       const tourBookings = await Booking.find({
//         hostel: { $in: hostelIds },
//         status: { $in: ["pending", "confirmed"] },
//         type: { $in: ["virtual tour", "physical tour"] },
//       })
//         .populate("user", "name email phoneNumber")
//         .populate("hostel", "name")
//         .select("type date status user hostel")
//         .sort({ date: 1 })
//         .limit(10)
//         .lean();

//       stats.tourBookings =
//         tourBookings.map((booking) => ({
//           _id: booking._id,
//           type: booking.type,
//           date: booking.date,
//           status: booking.status,
//           visitor: booking.user?.name || "Unknown",
//           email: booking.user?.email || "N/A",
//           phone: booking.user?.phoneNumber || "N/A",
//           hostel: booking.hostel?.name || "Unknown",
//         })) || [];

//       // Notifications
//       const notifications = await Notification.find({ user: req.user.id })
//         .sort({ createdAt: -1 })
//         .limit(5)
//         .select("message read createdAt")
//         .lean();
//       stats.unreadNotifications = await Notification.countDocuments({
//         user: req.user.id,
//         read: false,
//       });
//       stats.recentNotifications = notifications || [];

//       // Hostel performance
//       const hostelPerformance = await Booking.aggregate([
//         { $match: { hostel: { $in: hostelIds }, type: "paynow" } },
//         {
//           $lookup: {
//             from: "payments",
//             localField: "_id",
//             foreignField: "booking",
//             as: "payment",
//           },
//         },
//         { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
//         {
//           $group: {
//             _id: "$hostel",
//             totalBookings: { $sum: 1 },
//             totalRevenue: {
//               $sum: {
//                 $cond: [
//                   { $eq: ["$payment.status", "success"] },
//                   "$payment.amount",
//                   0,
//                 ],
//               },
//             },
//             confirmedBookings: {
//               $sum: {
//                 $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0],
//               },
//             },
//           },
//         },
//         {
//           $lookup: {
//             from: "hostels",
//             localField: "_id",
//             foreignField: "_id",
//             as: "hostel",
//           },
//         },
//         { $unwind: "$hostel" },
//         {
//           $project: {
//             name: "$hostel.name",
//             location: "$hostel.location",
//             totalBookings: 1,
//             confirmedBookings: 1,
//             conversionRate: {
//               $cond: [
//                 { $eq: ["$totalBookings", 0] },
//                 0,
//                 {
//                   $multiply: [
//                     { $divide: ["$confirmedBookings", "$totalBookings"] },
//                     100,
//                   ],
//                 },
//               ],
//             },
//             totalRevenue: { $divide: ["$totalRevenue", 100] },
//             _id: 0,
//           },
//         },
//       ]);
//       stats.hostelPerformance = hostelPerformance || [];

//       // Summary cards
//       stats.summary = {
//         totalHostels: hostelIds.length,
//         totalTenants: stats.tenants.length,
//         totalRevenue: stats.revenue,
//         pendingTours: stats.tourBookings.filter((b) => b.status === "pending")
//           .length,
//         occupancyRate:
//           stats.occupancy.length > 0
//             ? Math.round(
//                 stats.occupancy.reduce((sum, h) => sum + h.occupancyRate, 0) /
//                   stats.occupancy.length
//               )
//             : 0,
//       };
//     } else if (req.user.role === "superagent") {
//       // Get estates managed by superagent
//       const estateIds =
//         (await Estate.find({ superagent: req.user.id })
//           .select("_id")
//           .lean()
//           .then((estates) => estates.map((e) => e._id))) || [];

//       stats.estates = estateIds.length;

//       stats.hostels =
//         (await Hostel.countDocuments({
//           estate: { $in: estateIds },
//         })) || 0;

//       const hostelIds =
//         (await Hostel.find({ estate: { $in: estateIds } })
//           .select("_id")
//           .lean()
//           .then((hostels) => hostels.map((h) => h._id))) || [];

//       // Get pending tour bookings (virtual and physical tours)
//       stats.pendingBookings =
//         (await Booking.find({
//           hostel: { $in: hostelIds },
//           status: "pending",
//           type: { $in: ["virtual tour", "physical tour"] },
//         })
//           .populate("hostel", "name estate")
//           .populate("user", "name email phoneNumber")
//           .select("type date hostel status user createdAt")
//           .sort({ createdAt: -1 })
//           .limit(10)
//           .lean()) || [];

//       // Format pending bookings for better display
//       stats.pendingBookings = stats.pendingBookings.map((booking) => ({
//         _id: booking._id,
//         type: booking.type,
//         date: booking.date,
//         status: booking.status,
//         hostel: booking.hostel?.name || "Unknown",
//         estate: booking.hostel?.estate || "Unknown",
//         student: booking.user?.name || "Unknown",
//         email: booking.user?.email || "N/A",
//         phone: booking.user?.phoneNumber || "N/A",
//         createdAt: booking.createdAt,
//       }));

//       // Booking statistics by type and status
//       const bookingStats = await Booking.aggregate([
//         { $match: { hostel: { $in: hostelIds } } },
//         {
//           $group: {
//             _id: { status: "$status", type: "$type" },
//             count: { $sum: 1 },
//           },
//         },
//         {
//           $group: {
//             _id: "$_id.type",
//             total: { $sum: "$count" },
//             pending: {
//               $sum: {
//                 $cond: [{ $eq: ["$_id.status", "pending"] }, "$count", 0],
//               },
//             },
//             confirmed: {
//               $sum: {
//                 $cond: [{ $eq: ["$_id.status", "confirmed"] }, "$count", 0],
//               },
//             },
//           },
//         },
//         {
//           $project: {
//             type: "$_id",
//             total: 1,
//             pending: 1,
//             confirmed: 1,
//             conversionRate: {
//               $cond: [
//                 { $eq: ["$total", 0] },
//                 0,
//                 { $divide: ["$confirmed", "$total"] },
//               ],
//             },
//             _id: 0,
//           },
//         },
//       ]);
//       stats.bookingStats = bookingStats || [];

//       // Payment status for paynow bookings
//       const paymentStatus = await Payment.aggregate([
//         {
//           $match: {
//             booking: {
//               $in: await Booking.find({
//                 hostel: { $in: hostelIds },
//                 type: "paynow",
//               }).select("_id"),
//             },
//           },
//         },
//         {
//           $group: {
//             _id: "$status",
//             count: { $sum: 1 },
//             totalAmount: { $sum: "$amount" },
//           },
//         },
//         {
//           $project: {
//             status: "$_id",
//             count: 1,
//             totalAmount: { $divide: ["$totalAmount", 100] },
//             _id: 0,
//           },
//         },
//       ]);
//       stats.paymentStatus = paymentStatus || [];

//       // Overall performance metrics
//       const totalBookings =
//         (await Booking.countDocuments({
//           hostel: { $in: hostelIds },
//         })) || 0;
//       const confirmedBookings =
//         (await Booking.countDocuments({
//           hostel: { $in: hostelIds },
//           status: "confirmed",
//         })) || 0;
//       const pendingTours =
//         (await Booking.countDocuments({
//           hostel: { $in: hostelIds },
//           status: "pending",
//           type: { $in: ["virtual tour", "physical tour"] },
//         })) || 0;
//       const paynowBookings =
//         (await Booking.countDocuments({
//           hostel: { $in: hostelIds },
//           type: "paynow",
//         })) || 0;

//       stats.performance = {
//         totalBookings,
//         confirmedBookings,
//         pendingTours,
//         paynowBookings,
//         successRate: totalBookings
//           ? Math.round((confirmedBookings / totalBookings) * 100)
//           : 0,
//         pendingConversion: totalBookings
//           ? Math.round((pendingTours / totalBookings) * 100)
//           : 0,
//       };

//       // Estate performance
//       const estatePerformance = await Booking.aggregate([
//         { $match: { hostel: { $in: hostelIds } } },
//         {
//           $lookup: {
//             from: "hostels",
//             localField: "hostel",
//             foreignField: "_id",
//             as: "hostel",
//           },
//         },
//         { $unwind: "$hostel" },
//         {
//           $lookup: {
//             from: "estates",
//             localField: "hostel.estate",
//             foreignField: "_id",
//             as: "estate",
//           },
//         },
//         { $unwind: "$estate" },
//         {
//           $group: {
//             _id: "$estate._id",
//             estateName: { $first: "$estate.name" },
//             totalBookings: { $sum: 1 },
//             confirmedBookings: {
//               $sum: {
//                 $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0],
//               },
//             },
//             paynowBookings: {
//               $sum: {
//                 $cond: [{ $eq: ["$type", "paynow"] }, 1, 0],
//               },
//             },
//           },
//         },
//         {
//           $project: {
//             name: "$estateName",
//             totalBookings: 1,
//             confirmedBookings: 1,
//             paynowBookings: 1,
//             conversionRate: {
//               $cond: [
//                 { $eq: ["$totalBookings", 0] },
//                 0,
//                 {
//                   $multiply: [
//                     { $divide: ["$confirmedBookings", "$totalBookings"] },
//                     100,
//                   ],
//                 },
//               ],
//             },
//             _id: 0,
//           },
//         },
//       ]);
//       stats.estatePerformance = estatePerformance || [];

//       // Recent activity (all bookings)
//       const recentActivity =
//         (await Booking.find({
//           hostel: { $in: hostelIds },
//         })
//           .populate("hostel", "name")
//           .populate("user", "name")
//           .select("type status date hostel user createdAt")
//           .sort({ createdAt: -1 })
//           .limit(10)
//           .lean()) || [];

//       stats.recentActivity = recentActivity.map((booking) => ({
//         _id: booking._id,
//         type: booking.type,
//         status: booking.status,
//         date: booking.date,
//         hostel: booking.hostel?.name || "Unknown",
//         student: booking.user?.name || "Unknown",
//         createdAt: booking.createdAt,
//         action:
//           booking.status === "confirmed"
//             ? "Confirmed"
//             : booking.status === "pending"
//             ? "Requested"
//             : booking.status,
//       }));

//       // Notifications
//       const notifications =
//         (await Notification.find({ user: req.user.id })
//           .sort({ createdAt: -1 })
//           .limit(5)
//           .select("message read createdAt")
//           .lean()) || [];
//       stats.unreadNotifications =
//         (await Notification.countDocuments({
//           user: req.user.id,
//           read: false,
//         })) || 0;
//       stats.recentNotifications = notifications;

//       // Ensure empty arrays are handled properly
//       stats.pendingBookings = stats.pendingBookings || [];
//       stats.bookingStats = stats.bookingStats || [];
//       stats.paymentStatus = stats.paymentStatus || [];
//       stats.recentActivity = stats.recentActivity || [];
//       stats.recentNotifications = stats.recentNotifications || [];
//       stats.estatePerformance = stats.estatePerformance || [];

//       // Summary cards for superagent
//       stats.summary = {
//         totalEstates: stats.estates,
//         totalHostels: stats.hostels,
//         pendingTours: stats.pendingBookings.length,
//         totalBookings: totalBookings,
//         confirmedBookings: confirmedBookings,
//         paynowBookings: paynowBookings,
//         conversionRate: stats.performance.successRate,
//       };
//     } else if (req.user.role === "student") {
//       stats.bookings =
//         (await Booking.countDocuments({ user: req.user.id })) || 0;

//       stats.upcomingBookings =
//         (await Booking.find({
//           user: req.user.id,
//           date: { $gte: new Date() },
//         })
//           .populate("hostel", "name images price location")
//           .sort({ date: 1 })
//           .limit(5)
//           .lean()) || [];

//       // Format upcoming bookings
//       stats.upcomingBookings = stats.upcomingBookings.map((booking) => ({
//         _id: booking._id,
//         type: booking.type,
//         date: booking.date,
//         status: booking.status,
//         hostel: {
//           name: booking.hostel?.name || "Unknown",
//           price: booking.hostel?.price || 0,
//           location: booking.hostel?.location || "N/A",
//           images: booking.hostel?.images || [],
//         },
//       }));

//       // Past bookings for recommendations
//       const pastHostelIds =
//         (await Booking.find({ user: req.user.id }).distinct("hostel")) || [];

//       stats.recommendations =
//         (await Hostel.find({
//           _id: { $nin: pastHostelIds },
//           price: { $lte: 50000 },
//           estate: { $ne: null, $exists: true },
//         })
//           .populate("estate", "name location")
//           .limit(5)
//           .lean()) || [];

//       // Format recommendations
//       stats.recommendations = stats.recommendations.map((hostel) => ({
//         _id: hostel._id,
//         name: hostel.name,
//         price: hostel.price,
//         rooms: hostel.rooms,
//         images: hostel.images || [],
//         estate: hostel.estate?.name || "Independent",
//         location: hostel.estate?.location || hostel.location || "N/A",
//       }));

//       // Recent payments
//       stats.payments =
//         (await Payment.find({ user: req.user.id })
//           .sort({ createdAt: -1 })
//           .limit(5)
//           .lean()) || [];

//       // Format payments
//       stats.payments = stats.payments.map((payment) => ({
//         _id: payment._id,
//         amount: payment.amount / 100,
//         reference: payment.reference,
//         status: payment.status,
//         createdAt: payment.createdAt,
//       }));

//       // Booking history by type
//       const bookingHistory = await Booking.aggregate([
//         { $match: { user: req.user.id } },
//         {
//           $group: {
//             _id: "$type",
//             count: { $sum: 1 },
//             confirmed: {
//               $sum: {
//                 $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0],
//               },
//             },
//           },
//         },
//       ]);
//       stats.bookingHistory = bookingHistory || [];

//       // Notifications
//       const notifications =
//         (await Notification.find({ user: req.user.id })
//           .sort({ createdAt: -1 })
//           .limit(5)
//           .lean()) || [];
//       stats.unreadNotifications =
//         (await Notification.countDocuments({
//           user: req.user.id,
//           read: false,
//         })) || 0;
//       stats.recentNotifications = notifications;

//       // Summary for student
//       stats.summary = {
//         totalBookings: stats.bookings,
//         upcomingBookings: stats.upcomingBookings.length,
//         recommendations: stats.recommendations.length,
//       };

//       // Ensure empty arrays
//       stats.upcomingBookings = stats.upcomingBookings || [];
//       stats.recommendations = stats.recommendations || [];
//       stats.payments = stats.payments || [];
//       stats.recentNotifications = stats.recentNotifications || [];
//     } else {
//       stats.message = "Role not recognized";
//       stats.summary = { message: "Access denied" };
//     }

//     // Ensure all arrays are initialized to prevent undefined errors
//     stats = {
//       ...stats,
//       tenants: stats.tenants || [],
//       tourBookings: stats.tourBookings || [],
//       occupancy: stats.occupancy || [],
//       recentPayments: stats.recentPayments || [],
//       hostelPerformance: stats.hostelPerformance || [],
//       bookingStats: stats.bookingStats || [],
//       recentNotifications: stats.recentNotifications || [],
//       summary: stats.summary || {},
//     };

//     console.log("Dashboard Stats:", {
//       role: req.user.role,
//       estates: stats.estates || 0,
//       hostels: stats.hostels || 0,
//       pendingBookings: stats.pendingBookings?.length || 0,
//       totalBookings: stats.summary?.totalBookings || 0,
//     });

//     res.json(stats);
//   } catch (err) {
//     console.error("Error fetching dashboard data:", err);
//     res.status(500).json({
//       error: "Server error",
//       details: err.message,
//       summary: { error: "Failed to load dashboard" },
//     });
//   }
// };

// // Additional endpoint for superagent to get detailed booking analytics
// exports.getBookingAnalytics = async (req, res, next) => {
//   try {
//     if (req.user.role !== "superagent") {
//       return res.status(403).json({ error: "Access denied" });
//     }

//     const estateIds =
//       (await Estate.find({ superagent: req.user.id })
//         .select("_id")
//         .lean()
//         .then((estates) => estates.map((e) => e._id))) || [];

//     const hostelIds =
//       (await Hostel.find({ estate: { $in: estateIds } })
//         .select("_id")
//         .lean()
//         .then((hostels) => hostels.map((h) => h._id))) || [];

//     // Monthly booking trends
//     const monthlyTrends = await Booking.aggregate([
//       { $match: { hostel: { $in: hostelIds } } },
//       {
//         $group: {
//           _id: {
//             year: { $year: "$createdAt" },
//             month: { $month: "$createdAt" },
//             type: "$type",
//           },
//           count: { $sum: 1 },
//         },
//       },
//       {
//         $sort: { "_id.year": -1, "_id.month": -1 },
//       },
//       {
//         $limit: 12,
//       },
//     ]);

//     // Booking funnel analysis
//     const bookingFunnel = await Booking.aggregate([
//       { $match: { hostel: { $in: hostelIds } } },
//       {
//         $group: {
//           _id: "$status",
//           count: { $sum: 1 },
//           types: { $push: "$type" },
//         },
//       },
//       {
//         $project: {
//           status: "$_id",
//           count: 1,
//           typeBreakdown: {
//             $reduce: {
//               input: {
//                 $setUnion: [
//                   "$types",
//                   ["paynow", "virtual tour", "physical tour"],
//                 ],
//               },
//               initialValue: {},
//               in: {
//                 $cond: [
//                   {
//                     $in: [
//                       "$$this",
//                       ["paynow", "virtual tour", "physical tour"],
//                     ],
//                   },
//                   {
//                     $mergeObjects: [
//                       "$$value",
//                       {
//                         ["$$this"]: {
//                           $sum: [
//                             { $cond: [{ $eq: ["$$this", "$types"] }, 1, 0] },
//                             {
//                               $ifNull: [
//                                 {
//                                   $getField: {
//                                     field: "$$this",
//                                     input: "$$value",
//                                   },
//                                 },
//                                 0,
//                               ],
//                             },
//                           ],
//                         },
//                       },
//                     ],
//                   },
//                   "$$value",
//                 ],
//               },
//             },
//           },
//           _id: 0,
//         },
//       },
//     ]);

//     // Top performing hostels
//     const topHostels = await Booking.aggregate([
//       { $match: { hostel: { $in: hostelIds }, status: "confirmed" } },
//       {
//         $group: {
//           _id: "$hostel",
//           confirmedCount: { $sum: 1 },
//           types: { $push: "$type" },
//         },
//       },
//       {
//         $lookup: {
//           from: "hostels",
//           localField: "_id",
//           foreignField: "_id",
//           as: "hostel",
//         },
//       },
//       { $unwind: "$hostel" },
//       {
//         $project: {
//           name: "$hostel.name",
//           location: "$hostel.location",
//           confirmedCount: 1,
//           paynowCount: {
//             $size: {
//               $filter: {
//                 input: "$types",
//                 cond: { $eq: ["$$this", "paynow"] },
//               },
//             },
//           },
//           tourCount: {
//             $size: {
//               $filter: {
//                 input: "$types",
//                 cond: { $in: ["$$this", ["virtual tour", "physical tour"]] },
//               },
//             },
//           },
//           _id: 0,
//         },
//       },
//       { $sort: { confirmedCount: -1 } },
//       { $limit: 5 },
//     ]);

//     res.json({
//       monthlyTrends: monthlyTrends || [],
//       bookingFunnel: bookingFunnel || [],
//       topHostels: topHostels || [],
//       generatedAt: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("Error fetching booking analytics:", err);
//     res.status(500).json({
//       error: "Failed to fetch analytics",
//       details: err.message,
//     });
//   }
// };



// controllers/dashboardController.js
const Hostel = require("../models/Hostel");
const Booking = require("../models/Booking");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const User = require("../models/User");
const Estate = require("../models/Estate");

exports.getDashboard = async (req, res, next) => {
  try {
    let stats = {};
    console.log("User role:", req.user.role);

    if (req.user.role === "landlord") {
      // Directly get hostel IDs owned by the landlord
      const hostelIds = await Hostel.find({ owner: req.user.id })
        .select("_id")
        .lean()
        .then((hostels) => hostels.map((h) => h._id));

      // Hostels count
      stats.hostels = hostelIds.length;

      // Booking status breakdown
      const bookingStats = await Booking.aggregate([
        { $match: { hostel: { $in: hostelIds } } },
        {
          $group: {
            _id: { status: "$status", type: "$type" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            status: "$_id.status",
            type: "$_id.type",
            count: 1,
            _id: 0,
          },
        },
      ]);
      stats.bookingStats = bookingStats || [];

      // Tenants (confirmed paynow bookings)
      const tenants = await Booking.find({
        hostel: { $in: hostelIds },
        status: "confirmed",
        type: "paynow",
      })
        .populate("user", "name email phoneNumber")
        .populate("hostel", "name")
        .select("user hostel date status room")
        .lean();

      stats.tenants =
        tenants.map((booking) => ({
          _id: booking._id,
          tenant: booking.user?.name || "Unknown",
          email: booking.user?.email || "N/A",
          phoneNumber: booking.user?.phoneNumber || "N/A",
          room: booking.room || "N/A",
          hostel: booking.hostel?.name || "Unknown",
          status: booking.status,
          moveInDate: booking.date,
        })) || [];

      // Revenue and recent payments
      const revenueData = await Payment.aggregate([
        {
          $match: {
            booking: {
              $in: await Booking.find({
                hostel: { $in: hostelIds },
                status: "confirmed",
                type: "paynow",
              }).select("_id"),
            },
            status: "success",
          },
        },
        {
          $lookup: {
            from: "bookings",
            localField: "booking",
            foreignField: "_id",
            as: "booking",
          },
        },
        { $unwind: "$booking" },
        {
          $lookup: {
            from: "users",
            localField: "booking.user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            recentPayments: {
              $push: {
                _id: "$_id",
                tenant: "$user.name",
                amount: "$amount",
                reference: "$reference",
                createdAt: "$createdAt",
                status: "$status",
                hostel: "$booking.hostel",
              },
            },
          },
        },
        {
          $project: {
            totalRevenue: 1,
            recentPayments: { $slice: ["$recentPayments", 5] },
            _id: 0,
          },
        },
      ]);
      stats.revenue = revenueData[0]?.totalRevenue || 0;  // Removed /100 - DB already in Naira
      stats.recentPayments = revenueData[0]?.recentPayments || [];

      // Occupancy rates
      const hostels = await Hostel.find({ owner: req.user.id })
        .select("name rooms price location")
        .lean();

      stats.occupancy =
        (await Promise.all(
          hostels.map(async (hostel) => {
            const bookedRooms = await Booking.countDocuments({
              hostel: hostel._id,
              status: "confirmed",
              type: "paynow",
              date: { $gte: new Date() },
            });
            return {
              _id: hostel._id,
              name: hostel.name,
              occupancyRate: hostel.rooms
                ? Math.round((bookedRooms / hostel.rooms) * 100)
                : 0,
              occupiedRooms: bookedRooms,
              totalRooms: hostel.rooms || 0,
              availableRooms: hostel.rooms ? hostel.rooms - bookedRooms : 0,
              price: hostel.price,
              location: hostel.location || "N/A",
            };
          })
        )) || [];

      // Tour bookings (virtual and physical)
      const tourBookings = await Booking.find({
        hostel: { $in: hostelIds },
        status: { $in: ["pending", "confirmed"] },
        type: { $in: ["virtual tour", "physical tour"] },
      })
        .populate("user", "name email phoneNumber")
        .populate("hostel", "name")
        .select("type date status user hostel")
        .sort({ date: 1 })
        .limit(10)
        .lean();

      stats.tourBookings =
        tourBookings.map((booking) => ({
          _id: booking._id,
          type: booking.type,
          date: booking.date,
          status: booking.status,
          visitor: booking.user?.name || "Unknown",
          email: booking.user?.email || "N/A",
          phone: booking.user?.phoneNumber || "N/A",
          hostel: booking.hostel?.name || "Unknown",
        })) || [];

      // Notifications
      const notifications = await Notification.find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("message read createdAt")
        .lean();
      stats.unreadNotifications = await Notification.countDocuments({
        user: req.user.id,
        read: false,
      });
      stats.recentNotifications = notifications || [];

      // Hostel performance
      const hostelPerformance = await Booking.aggregate([
        { $match: { hostel: { $in: hostelIds }, type: "paynow" } },
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "booking",
            as: "payment",
          },
        },
        { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: "$hostel",
            totalBookings: { $sum: 1 },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$payment.status", "success"] },
                  "$payment.amount",
                  0,
                ],
              },
            },
            confirmedBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0],
              },
            },
          },
        },
        {
          $lookup: {
            from: "hostels",
            localField: "_id",
            foreignField: "_id",
            as: "hostel",
          },
        },
        { $unwind: "$hostel" },
        {
          $project: {
            name: "$hostel.name",
            location: "$hostel.location",
            totalBookings: 1,
            confirmedBookings: 1,
            conversionRate: {
              $cond: [
                { $eq: ["$totalBookings", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$confirmedBookings", "$totalBookings"] },
                    100,
                  ],
                },
              ],
            },
            totalRevenue: "$totalRevenue",  // Removed /100 - DB already in Naira
            _id: 0,
          },
        },
      ]);
      stats.hostelPerformance = hostelPerformance || [];

      // Summary cards
      stats.summary = {
        totalHostels: hostelIds.length,
        totalTenants: stats.tenants.length,
        totalRevenue: stats.revenue,
        pendingTours: stats.tourBookings.filter((b) => b.status === "pending")
          .length,
        occupancyRate:
          stats.occupancy.length > 0
            ? Math.round(
                stats.occupancy.reduce((sum, h) => sum + h.occupancyRate, 0) /
                  stats.occupancy.length
              )
            : 0,
      };
    } else if (req.user.role === "superagent") {
      // Get estates managed by superagent
      const estateIds =
        (await Estate.find({ superagent: req.user.id })
          .select("_id")
          .lean()
          .then((estates) => estates.map((e) => e._id))) || [];

      stats.estates = estateIds.length;

      stats.hostels =
        (await Hostel.countDocuments({
          estate: { $in: estateIds },
        })) || 0;

      const hostelIds =
        (await Hostel.find({ estate: { $in: estateIds } })
          .select("_id")
          .lean()
          .then((hostels) => hostels.map((h) => h._id))) || [];

      // Get pending tour bookings (virtual and physical tours)
      stats.pendingBookings =
        (await Booking.find({
          hostel: { $in: hostelIds },
          status: "pending",
          type: { $in: ["virtual tour", "physical tour"] },
        })
          .populate("hostel", "name estate")
          .populate("user", "name email phoneNumber")
          .select("type date hostel status user createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()) || [];

      // Format pending bookings for better display
      stats.pendingBookings = stats.pendingBookings.map((booking) => ({
        _id: booking._id,
        type: booking.type,
        date: booking.date,
        status: booking.status,
        hostel: booking.hostel?.name || "Unknown",
        estate: booking.hostel?.estate || "Unknown",
        student: booking.user?.name || "Unknown",
        email: booking.user?.email || "N/A",
        phone: booking.user?.phoneNumber || "N/A",
        createdAt: booking.createdAt,
      }));

      // Booking statistics by type and status
      const bookingStats = await Booking.aggregate([
        { $match: { hostel: { $in: hostelIds } } },
        {
          $group: {
            _id: { status: "$status", type: "$type" },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.type",
            total: { $sum: "$count" },
            pending: {
              $sum: {
                $cond: [{ $eq: ["$_id.status", "pending"] }, "$count", 0],
              },
            },
            confirmed: {
              $sum: {
                $cond: [{ $eq: ["$_id.status", "confirmed"] }, "$count", 0],
              },
            },
          },
        },
        {
          $project: {
            type: "$_id",
            total: 1,
            pending: 1,
            confirmed: 1,
            conversionRate: {
              $cond: [
                { $eq: ["$total", 0] },
                0,
                { $divide: ["$confirmed", "$total"] },
              ],
            },
            _id: 0,
          },
        },
      ]);
      stats.bookingStats = bookingStats || [];

      // Payment status for paynow bookings
      const paymentStatus = await Payment.aggregate([
        {
          $match: {
            booking: {
              $in: await Booking.find({
                hostel: { $in: hostelIds },
                type: "paynow",
              }).select("_id"),
            },
          },
        },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            status: "$_id",
            count: 1,
            totalAmount: "$totalAmount",  // Removed /100 - DB already in Naira
            _id: 0,
          },
        },
      ]);
      stats.paymentStatus = paymentStatus || [];

      // Overall performance metrics
      const totalBookings =
        (await Booking.countDocuments({
          hostel: { $in: hostelIds },
        })) || 0;
      const confirmedBookings =
        (await Booking.countDocuments({
          hostel: { $in: hostelIds },
          status: "confirmed",
        })) || 0;
      const pendingTours =
        (await Booking.countDocuments({
          hostel: { $in: hostelIds },
          status: "pending",
          type: { $in: ["virtual tour", "physical tour"] },
        })) || 0;
      const paynowBookings =
        (await Booking.countDocuments({
          hostel: { $in: hostelIds },
          type: "paynow",
        })) || 0;

      stats.performance = {
        totalBookings,
        confirmedBookings,
        pendingTours,
        paynowBookings,
        successRate: totalBookings
          ? Math.round((confirmedBookings / totalBookings) * 100)
          : 0,
        pendingConversion: totalBookings
          ? Math.round((pendingTours / totalBookings) * 100)
          : 0,
      };

      // Estate performance
      const estatePerformance = await Booking.aggregate([
        { $match: { hostel: { $in: hostelIds } } },
        {
          $lookup: {
            from: "hostels",
            localField: "hostel",
            foreignField: "_id",
            as: "hostel",
          },
        },
        { $unwind: "$hostel" },
        {
          $lookup: {
            from: "estates",
            localField: "hostel.estate",
            foreignField: "_id",
            as: "estate",
          },
        },
        { $unwind: "$estate" },
        {
          $group: {
            _id: "$estate._id",
            estateName: { $first: "$estate.name" },
            totalBookings: { $sum: 1 },
            confirmedBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0],
              },
            },
            paynowBookings: {
              $sum: {
                $cond: [{ $eq: ["$type", "paynow"] }, 1, 0],
              },
            },
          },
        },
        {
          $project: {
            name: "$estateName",
            totalBookings: 1,
            confirmedBookings: 1,
            paynowBookings: 1,
            conversionRate: {
              $cond: [
                { $eq: ["$totalBookings", 0] },
                0,
                {
                  $multiply: [
                    { $divide: ["$confirmedBookings", "$totalBookings"] },
                    100,
                  ],
                },
              ],
            },
            _id: 0,
          },
        },
      ]);
      stats.estatePerformance = estatePerformance || [];

      // Recent activity (all bookings)
      const recentActivity =
        (await Booking.find({
          hostel: { $in: hostelIds },
        })
          .populate("hostel", "name")
          .populate("user", "name")
          .select("type status date hostel user createdAt")
          .sort({ createdAt: -1 })
          .limit(10)
          .lean()) || [];

      stats.recentActivity = recentActivity.map((booking) => ({
        _id: booking._id,
        type: booking.type,
        status: booking.status,
        date: booking.date,
        hostel: booking.hostel?.name || "Unknown",
        student: booking.user?.name || "Unknown",
        createdAt: booking.createdAt,
        action:
          booking.status === "confirmed"
            ? "Confirmed"
            : booking.status === "pending"
            ? "Requested"
            : booking.status,
      }));

      // Notifications
      const notifications =
        (await Notification.find({ user: req.user.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .select("message read createdAt")
          .lean()) || [];
      stats.unreadNotifications =
        (await Notification.countDocuments({
          user: req.user.id,
          read: false,
        })) || 0;
      stats.recentNotifications = notifications;

      // Ensure empty arrays are handled properly
      stats.pendingBookings = stats.pendingBookings || [];
      stats.bookingStats = stats.bookingStats || [];
      stats.paymentStatus = stats.paymentStatus || [];
      stats.recentActivity = stats.recentActivity || [];
      stats.recentNotifications = stats.recentNotifications || [];
      stats.estatePerformance = stats.estatePerformance || [];

      // Summary cards for superagent
      stats.summary = {
        totalEstates: stats.estates,
        totalHostels: stats.hostels,
        pendingTours: stats.pendingBookings.length,
        totalBookings: totalBookings,
        confirmedBookings: confirmedBookings,
        paynowBookings: paynowBookings,
        conversionRate: stats.performance.successRate,
      };
    } else if (req.user.role === "student") {
      stats.bookings =
        (await Booking.countDocuments({ user: req.user.id })) || 0;

      stats.upcomingBookings =
        (await Booking.find({
          user: req.user.id,
          date: { $gte: new Date() },
        })
          .populate("hostel", "name images price location")
          .sort({ date: 1 })
          .limit(5)
          .lean()) || [];

      // Format upcoming bookings
      stats.upcomingBookings = stats.upcomingBookings.map((booking) => ({
        _id: booking._id,
        type: booking.type,
        date: booking.date,
        status: booking.status,
        hostel: {
          name: booking.hostel?.name || "Unknown",
          price: booking.hostel?.price || 0,
          location: booking.hostel?.location || "N/A",
          images: booking.hostel?.images || [],
        },
      }));

      // Past bookings for recommendations
      const pastHostelIds =
        (await Booking.find({ user: req.user.id }).distinct("hostel")) || [];

      stats.recommendations =
        (await Hostel.find({
          _id: { $nin: pastHostelIds },
          price: { $lte: 50000 },
          estate: { $ne: null, $exists: true },
        })
          .populate("estate", "name location")
          .limit(5)
          .lean()) || [];

      // Format recommendations
      stats.recommendations = stats.recommendations.map((hostel) => ({
        _id: hostel._id,
        name: hostel.name,
        price: hostel.price,
        rooms: hostel.rooms,
        images: hostel.images || [],
        estate: hostel.estate?.name || "Independent",
        location: hostel.estate?.location || hostel.location || "N/A",
      }));

      // Recent payments
      stats.payments =
        (await Payment.find({ user: req.user.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()) || [];

      // Format payments - REMOVED /100: DB already stores in Naira
      stats.payments = stats.payments.map((payment) => ({
        _id: payment._id,
        amount: payment.amount,  // No extra /100
        reference: payment.reference,
        status: payment.status,
        createdAt: payment.createdAt,
      }));

      // Booking history by type
      const bookingHistory = await Booking.aggregate([
        { $match: { user: req.user.id } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            confirmed: {
              $sum: {
                $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0],
              },
            },
          },
        },
      ]);
      stats.bookingHistory = bookingHistory || [];

      // Notifications
      const notifications =
        (await Notification.find({ user: req.user.id })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()) || [];
      stats.unreadNotifications =
        (await Notification.countDocuments({
          user: req.user.id,
          read: false,
        })) || 0;
      stats.recentNotifications = notifications;

      // Summary for student
      stats.summary = {
        totalBookings: stats.bookings,
        upcomingBookings: stats.upcomingBookings.length,
        recommendations: stats.recommendations.length,
      };

      // Ensure empty arrays
      stats.upcomingBookings = stats.upcomingBookings || [];
      stats.recommendations = stats.recommendations || [];
      stats.payments = stats.payments || [];
      stats.recentNotifications = stats.recentNotifications || [];
    } else {
      stats.message = "Role not recognized";
      stats.summary = { message: "Access denied" };
    }

    // Ensure all arrays are initialized to prevent undefined errors
    stats = {
      ...stats,
      tenants: stats.tenants || [],
      tourBookings: stats.tourBookings || [],
      occupancy: stats.occupancy || [],
      recentPayments: stats.recentPayments || [],
      hostelPerformance: stats.hostelPerformance || [],
      bookingStats: stats.bookingStats || [],
      recentNotifications: stats.recentNotifications || [],
      summary: stats.summary || {},
    };

    console.log("Dashboard Stats:", {
      role: req.user.role,
      estates: stats.estates || 0,
      hostels: stats.hostels || 0,
      pendingBookings: stats.pendingBookings?.length || 0,
      totalBookings: stats.summary?.totalBookings || 0,
    });

    res.json(stats);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({
      error: "Server error",
      details: err.message,
      summary: { error: "Failed to load dashboard" },
    });
  }
};

// Additional endpoint for superagent to get detailed booking analytics
exports.getBookingAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== "superagent") {
      return res.status(403).json({ error: "Access denied" });
    }

    const estateIds =
      (await Estate.find({ superagent: req.user.id })
        .select("_id")
        .lean()
        .then((estates) => estates.map((e) => e._id))) || [];

    const hostelIds =
      (await Hostel.find({ estate: { $in: estateIds } })
        .select("_id")
        .lean()
        .then((hostels) => hostels.map((h) => h._id))) || [];

    // Monthly booking trends
    const monthlyTrends = await Booking.aggregate([
      { $match: { hostel: { $in: hostelIds } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            type: "$type",
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 },
      },
      {
        $limit: 12,
      },
    ]);

    // Booking funnel analysis
    const bookingFunnel = await Booking.aggregate([
      { $match: { hostel: { $in: hostelIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          types: { $push: "$type" },
        },
      },
      {
        $project: {
          status: "$_id",
          count: 1,
          typeBreakdown: {
            $reduce: {
              input: {
                $setUnion: [
                  "$types",
                  ["paynow", "virtual tour", "physical tour"],
                ],
              },
              initialValue: {},
              in: {
                $cond: [
                  {
                    $in: [
                      "$$this",
                      ["paynow", "virtual tour", "physical tour"],
                    ],
                  },
                  {
                    $mergeObjects: [
                      "$$value",
                      {
                        ["$$this"]: {
                          $sum: [
                            { $cond: [{ $eq: ["$$this", "$types"] }, 1, 0] },
                            {
                              $ifNull: [
                                {
                                  $getField: {
                                    field: "$$this",
                                    input: "$$value",
                                  },
                                },
                                0,
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                  "$$value",
                ],
              },
            },
          },
          _id: 0,
        },
      },
    ]);

    // Top performing hostels
    const topHostels = await Booking.aggregate([
      { $match: { hostel: { $in: hostelIds }, status: "confirmed" } },
      {
        $group: {
          _id: "$hostel",
          confirmedCount: { $sum: 1 },
          types: { $push: "$type" },
        },
      },
      {
        $lookup: {
          from: "hostels",
          localField: "_id",
          foreignField: "_id",
          as: "hostel",
        },
      },
      { $unwind: "$hostel" },
      {
        $project: {
          name: "$hostel.name",
          location: "$hostel.location",
          confirmedCount: 1,
          paynowCount: {
            $size: {
              $filter: {
                input: "$types",
                cond: { $eq: ["$$this", "paynow"] },
              },
            },
          },
          tourCount: {
            $size: {
              $filter: {
                input: "$types",
                cond: { $in: ["$$this", ["virtual tour", "physical tour"]] },
              },
            },
          },
          _id: 0,
        },
      },
      { $sort: { confirmedCount: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      monthlyTrends: monthlyTrends || [],
      bookingFunnel: bookingFunnel || [],
      topHostels: topHostels || [],
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Error fetching booking analytics:", err);
    res.status(500).json({
      error: "Failed to fetch analytics",
      details: err.message,
    });
  }
};
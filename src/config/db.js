// const mongoose = require("mongoose");
// const logger = require("../utils/logger");

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     logger.info("✅ DB connection successful");
//   } catch (err) {
//     logger.error(`MongoDB connection error: ${err.message}`);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;

require("dotenv").config(); // Load environment variables

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ DB connection successful");
  } catch (error) {
    console.error("❌ DB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const errorMiddleware = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL || "https://fifthlab-collaboration.onrender.com",
  "http://localhost:3000",
  "http://localhost:8080",
  "https://msg-app-5mwq.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new AppError(`CORS policy: Origin ${origin} not allowed`, 403));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/estates", require("./routes/estateRoutes"));
app.use("/api/notification", require("./routes/notificationRoutes"));
app.use("/api/hostels", require("./routes/hostelRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.use(errorMiddleware);
1;
app.use((err, req, res, next) => {
  console.error(err); // Log the full error for debugging
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ msg: message });
});

module.exports = app;

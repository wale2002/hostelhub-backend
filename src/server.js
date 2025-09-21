const http = require("http");
const connectDB = require("./config/db");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

connectDB();

const server = http.createServer(app);
server.listen(PORT, () => logger.info(`🚀 Server running on the port ${PORT}`));

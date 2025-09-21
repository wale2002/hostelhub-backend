exports.formatError = (err) => ({
  msg: err.message,
  stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
});

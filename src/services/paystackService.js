const axios = require("axios");
const { secretKey } = require("../config/paystack");

const paystackApi = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${secretKey}`,
    "Content-Type": "application/json", // Explicitly set Content-Type
  },
});

exports.initializePayment = async (amount, email, metadata) => {
  // Validate inputs
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Invalid email format");
  }
  if (metadata && typeof metadata !== "object") {
    throw new Error("Metadata must be a valid JSON object");
  }

  try {
    const response = await paystackApi.post("/transaction/initialize", {
      amount: amount * 100, // Convert to kobo
      email,
      metadata: metadata || {}, // Ensure metadata is an object
    });
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to initialize payment"
    );
  }
};

exports.verifyPayment = async (reference) => {
  if (!reference || typeof reference !== "string") {
    throw new Error("Valid reference is required");
  }

  try {
    const response = await paystackApi.get(`/transaction/verify/${reference}`);
    console.log("Paystack verification response:", response.data); // Log full response
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to verify payment"
    );
  }
};

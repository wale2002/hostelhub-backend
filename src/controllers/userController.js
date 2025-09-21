const User = require("../models/User");

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = Object.keys(req.body);
    const user = await User.findById(req.user.id);
    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getLandlords = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (page - 1) * limit;

    // Build the filter
    let filter = { role: "landlord" };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const landlords = await User.find(filter)
      .select("name email role createdAt")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: landlords.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: landlords,
    });
  } catch (err) {
    next(err);
  }
};

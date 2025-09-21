const Notification = require("../models/Notification");

exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (req, res, next) => {
  try {
    const { message, userId } = req.body;
    const notification = new Notification({ message, user: userId });
    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    next(err);
  }
};

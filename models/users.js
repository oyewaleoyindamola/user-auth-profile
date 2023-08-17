const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: { type: String, minlength: 3, required: "First name is required" },
  lastName: { type: String, minlength: 3, required: "Last name is required" },
  email: { type: String, minlength: 3, required: "Email is required" },
  password: { type: String, minlength: 8, required: "Password is required" },
  role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
  dateCreated: { type: Date, default: new Date().toJSON() },
  profileImage: { type: String },
  dateUpdated: { type: Date },
});

const User = mongoose.model("user", userSchema);

exports.User = User;

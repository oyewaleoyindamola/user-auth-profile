const express = require("express");
const multer = require("multer");

const { UserController } = require("../controllers/user.controller");
const { authVerification } = require("../middleware/user");

const userRoutes = express.Router();

// multer configurations
const storage = multer.memoryStorage();
const upload = multer({ storage });

userRoutes.post("/signup", UserController.registration);
userRoutes.post("/signin", UserController.login);
userRoutes.get("/getUserInfo", authVerification, UserController.getProfile);
userRoutes.put(
  "/uploadProfileImage",
  authVerification,
  upload.single("profileImage"),
  UserController.uploadProfileImage
);

exports.userRoutes = userRoutes;

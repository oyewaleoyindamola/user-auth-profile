const express = require("express");
const multer = require("multer");

const { UserController } = require("../controllers/user.controller");
const { authVerification } = require("../middleware/user");
const Routes = require("../utils/routes");

const userRoutes = express.Router();

// multer configurations
const storage = multer.memoryStorage();
const upload = multer({ storage });

userRoutes.post(Routes.signup, UserController.registration)
userRoutes.post(Routes.signin, UserController.login);
userRoutes.get(Routes.getUserInfo, authVerification, UserController.getProfile);
userRoutes.put(
    Routes.uploadProfileImage,
  authVerification,
  upload.single("profileImage"),
  UserController.uploadProfileImage
);

exports.userRoutes = userRoutes;

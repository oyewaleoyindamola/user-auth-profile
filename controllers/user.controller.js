const Joi = require("joi");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;

const { User } = require("../models/users");
const { createToken } = require("../utils/createToken");
const logger = require("../utils/log.config");

class UserController {
  static async registration(req, res) {
    const userSchemaValidation = Joi.object({
      firstName: Joi.string().min(3).required(),
      lastName: Joi.string().min(3).required(),
      email: Joi.string().min(3).required().email(),
      password: Joi.string()
        .pattern(
          new RegExp("^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!]).{8,}$")
        )
        .required()
        .messages({
          "string.pattern.base":
            "Password must contain at least one number, one letter, and one special character",
        }),
    });

    const { error } = userSchemaValidation.validate(req.body);

    if (error) {
      logger.log(
        "error",
        `Client just entered a wrong detail with the following error${error.details[0].message?.replaceAll(
          '"',
          ""
        )}`
      );
      return res.status(400).send({
        responseCode: "80",
        responseMessage: error.details[0].message?.replaceAll('"', ""),
        data: null,
      });
    }

    const { firstName, lastName, email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        logger.log(
          "error",
          `${
            firstName + " " + lastName
          } tried creating a duplicate account with same email`
        );
        return res.status(400).send({
          responseCode: "80",
          responseMessage: "User already exist",
          data: null,
        });
      }

      const salt = await bcrypt.genSalt(10);
      user = new User({
        firstName,
        lastName,
        email,
        password,
        profileImage: null,
        dateCreated: new Date().toJSON(),
        dateUpdated: null,
      });
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      logger.log(
        "info",
        `User ${user.firstName + " " + user.lastName} just created an account`
      );
      res.status(201).send({
        responseCode: "00",
        responseMessage: "User created successfully",
        data: {
          _id: user._id,
          Name: user.firstName + " " + user.lastName,
          email: user.email,
          dateCreated: user.dateCreated,
          dateUpdated: user.dateUpdated,
          role: user.role,
          profileImage: user.profileImage,
        },
      });
    } catch (error) {
      res.status(500).send({
        responseCode: "90",
        responseMessage: "Internal server error",
        data: error.message,
      });
      logger.log(
        "info",
        `${error.message}`
      );
      console.log(error.message);
    }
  }

  static async login(req, res) {
    const userSchemaValidation = Joi.object({
      email: Joi.string().min(3).required().email(),
      password: Joi.string()
        .required()
        .pattern(
          new RegExp("^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!]).{8,}$")
        )
        .required()
        .messages({
          "string.pattern.base":
            "Password must contain at least one number, one letter, and one special character",
        }),
    });

    const { error } = userSchemaValidation.validate(req.body);

    if (error)
      return res.status(400).send({
        responseCode: "80",
        responseMessage: error.details[0].message?.replaceAll('"', ""),
        data: null,
      });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user)
        return res.status(400).send({
          responseCode: "80",
          responseMessage: "Invalid email or password",
          data: null,
        });

      const validatePassword = await bcrypt.compare(password, user.password);
      if (!validatePassword) {
        return res.status(400).send({
          responseCode: "80",
          responseMessage: "Invalid email or password",
          data: null,
        });
      }

      const token = createToken(user);
      res.status(200).send({
        responseCode: "00",
        responseMessage: "Login successfully",
        data: {
          token,
        },
      });
    } catch (error) {
      res.status(500).send({
        responseCode: "90",
        responseMessage: "Internal server error",
        data: error.message,
      });

      console.log(error);
    }
  }

  static async getProfile(req, res) {
    const user = await User.findOne({ _id: req.user._id });
    try {
      if (!user) {
        return res.status(400).send({
          responseCode: "90",
          responseMessage: "No user found",
          data: null,
        });
      }

      res.status(200).send({
        responseCode: "90",
        responseMessage: "User retrieved successfully",
        data: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profileImage: user.profileImage,
          dateCreated: user.dateCreated,
          dateUpdated: user.dateUpdated,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).send({
        responseCode: "90",
        responseMessage: "Internal server error",
        data: error.message,
      });

      console.log(error);
    }
  }

  static async uploadProfileImage(req, res) {
    try {
      const user = await User.findOne({ _id: req.user._id });
      if (!user)
        return res.status(400).send({
          responseCode: "80",
          responseMessage: "No user found",
          data: null,
        });
      // Upload the image to Cloudinary
      await cloudinary.uploader
        .upload_stream(
          { folder: "uploads" }, // You can specify a folder in Cloudinary
          (error, result) => {
            if (error) {
              console.error("Error uploading image:", error);
              return res.status(500).json({ error: "Image upload failed" });
            }

            user.profileImage = result.secure_url;
            user.dateUpdated = new Date().toJSON();

            user.save();
            res.status(200).send({
              responseCode: "00",
              responseMessage: "Profile image upload successfully",
              data: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profileImage: user.profileImage,
                dateCreated: user.dateCreated,
                dateUpdated: user.dateUpdated,
                role: user.role,
              },
            });
          }
        )
        .end(req.file.buffer);
    } catch (error) {
      res.status(500).send({
        responseCode: "90",
        responseMessage: "Internal server error",
        data: error.message,
      });

      console.log(error);
    }
  }

  static async logout() {}
}

exports.UserController = UserController;

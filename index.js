const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary").v2;

const { userRoutes } = require("./routes/user");

const server = express();

//configs
dotenv.config();
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// .env data
const port = process.env.PORT || 9000;
const connection_string = process.env.CONNECTION_STRING;
const cloud_name = process.env.CLOUD_NAME;
const api_key = process.env.API_KEY;
const api_secret = process.env.API_SECRET;

// cloudinary configurations
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});
 
// routes
server.use("/api/v1/auth", userRoutes);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

mongoose
  .connect(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connection established...");
  })
  .catch((err) => {
    console.log(`Database connection failed: ${err}`);
  });

const jwt = require("jsonwebtoken");

const authVerification = async (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).send({
      responseCode: "95",
      responseMessage: "User is not authenticated",
      data: null,
    });
  }

  const decodedToken = token.replaceAll("Bearer ", "");
  if (!decodedToken) {
    return res.status(401).send({
      responseCode: "95",
      responseMessage: "Invalid token supplied",
      data: null,
    });
  }

  try {
    const payload = jwt.verify(decodedToken, process.env.SECRET_KEY);
    req.user = payload;
    next();
  } catch (error) {
    res.status(500).send({
      responseCode: "90",
      responseMessage: "Internal server error",
      data: error.message,
    });

    console.log(error);
  }
};


exports.authVerification = authVerification
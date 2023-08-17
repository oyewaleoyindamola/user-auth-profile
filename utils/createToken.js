const jwt = require("jsonwebtoken");

const createToken = (user) => {
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });
  return token;
};

exports.createToken = createToken
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  return jwt.sign({ _id: user._id }, process.env.JWT_TOKEN_KEY, {
    expiresIn: process.env.TOKEN_EXPIRATION_TIME || "1d",
  });
};

const verifyToken = (token, key, callback) => {
  jwt.verify(token, key, (err, user) => callback(err, user));
};

const generateTokenWithSecret = (user, secret) => {
  return jwt.sign(user, secret);
};

const decodeToken = (token) => {
  return jwt.decode(token, { complete: true, json: true });
};

module.exports = {
  generateAccessToken,
  verifyToken,
  generateTokenWithSecret,
  decodeToken,
};

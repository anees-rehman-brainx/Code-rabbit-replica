const jwtService = require('../services/jwtService');
const userService = require('../services/userService');

const verifyUser = async (req, res, next) => {
  if (!req.headers.platform)
    return res.status(403).json({ error: "'platform' required in headers" });
  const authHeader = req.headers.access_token;
  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwtService.verifyToken(
      token,
      process.env.JWT_TOKEN_KEY,
      async (err, user) => {
        if (err) {
          return res.status(401).json({ error: 'Token is not valid!' });
        }

        const dbUser = await userService.getOneUser(user);
        if (!dbUser) return res.status(404).json({ error: 'User not found' });

        req.user = dbUser;
        next();
      }
    );
  } else {
    res.status(403).json({ error: "'access_token' required in headers" });
  }
};

module.exports = { verifyUser };

const { findBy } = require("../users/users-model");

const checkPayload = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || username.trim().length === 0) {
      res.status(401).json({ message: "username and password required" });
    } else if (!password || password.trim().length === 0) {
      res.status(401).json({ message: "username and password required" });
    } else {
      next();
    }
  } catch (e) {
    res.status(500).json(`Payload error: ${e}`);
  }
};
const checkUsernameExistsinDB = async (req, res, next) => {
  try {
    const rows = await findBy({ username: req.body.username });
    if (rows.length) {
        req.foundUserData = rows[0]
        next();
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    res.status(500).json(`checkUsernameMiddleware: ${e}`);
  }
};

const checkUsernameTaken = async (req, res, next) => {
  try {
    const rows = await findBy({ username: req.body.username });
    if (rows.length) {
      res.status(401).json({ message: "username taken" });
    } else {
      next();
    }
  } catch (e) {
    res.status(500).json(`checkUsernameMiddleware: ${e}`);
  }
};

module.exports = { checkPayload, checkUsernameExistsinDB, checkUsernameTaken };

const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {JWT_SECRET} = require("../secret/index");
const Users = require("../users/users-model");
const {
  checkPayload,
  checkUsernameExistsinDB,
  checkUsernameTaken,
} = require("../auth/auth-middleware");

function makeToken(user) {
  const payload = {
    subject: user.id,
    username: user.username,
  };
  const options = {
    expiresIn: "1d",
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

router.post("/register", checkPayload, checkUsernameTaken, async (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
  try {
    const hash = bcrypt.hashSync(req.body.password, 8);
    const newUser = await Users.add({
      username: req.body.username,
      password: hash,
    });
    res.status(201).json(newUser);
  } catch (e) {
    res.status(500).json(`Server error: ${e.message}`);
  }
});

router.post("/login", checkPayload, checkUsernameExistsinDB, (req, res) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
  try {
    const verified = bcrypt.compareSync(
      req.body.password,
      req.foundUserData.password
    );
    if (verified) {
      const user = req.foundUserData;
      const token = makeToken(user);
      
      const userName = user.username;
      res
        .status(200)
        .json({ message: `welcome, ${userName}`, token });
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (e) {
    res.status(500).json(`Server error: ${e.message}`);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../models/User");
const auth = require("../middleware/auth");

//@route    GET api/auth
//@desc     Get logged in user
//@access   Private

router.get("/", auth, async (req, res) => {
  try {
    // Get the user from MongoDB by id. Don't get the password

    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server error");
  }
});

//@route    POST api/auth
//@desc    Authenticate a user by sending credentials
//@access   Public
router.post(
  "/",
  [
    check("email", "Please include a valid email address").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Search for a user in the DB
      let user = await User.findOne({ email });

      if (!user) {
        // User not found in the DB
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ msg: "Invalid credentials" });
      }

      // Once user is verified, create a payload
      const payload = {
        user: {
          id: user.id, // Using this id we will fetch contacts of user
        },
      };

      // Keep this user logged in
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          // After sign in throws an error or return token
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.err(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", (req, res) => {
  res.render("partials/layout.ejs", { body: "register", error:"" });
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      // Add logic for existing user (e.g., render register page with an error message)
      res.render("partials/layout.ejs", { body: "register", 
        error: "Username already exists. Choose a different one.",
      });
    } else {
      // Create new user
      const new_user = new User({
        username: req.body.username,
      });

      new_user.password = new_user.generateHash(req.body.password);
      new_user.save();
      // Add logic for successful registration (e.g., redirect to login page)
      res.redirect("/login");
    }
  } catch (error) {
    // Handle error (e.g., render register page with an error message)
    console.error(error);
    res.render("partials/layout.ejs", { body: "register", 
      error: "An error occurred. Please try again.",
    });
  }
});
module.exports = router;

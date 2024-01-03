const express = require("express");
const router = express.Router();
const User = require("../models/user");

router.get("/", (req, res) => {
  const error = req.session.errorMessage||""
  delete req.session.errorMessage;
  res.render("partials/layout.ejs", { body: "login", error: error });
});

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username: req.body.username });

    if (user && user.validPassword(req.body.password)) {
      req.session.user = user;
      const redirectTo = req.session.returnTo || '/'; 
      delete req.session.returnTo;
      res.redirect(redirectTo);
    } else {
      res.render("partials/layout.ejs", {
        body: "login",
        error: "Invalid username or password",
      });
    }
  } catch (error) {
    console.error(error);
    res.render("partials/layout.ejs", {
      body: "login",
      error: "An error occurred. Please try again.",
    });
  }
});

module.exports = router;

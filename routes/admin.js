const express = require("express");
const router = express.Router();
const User = require("../models/user");

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.redirect("/"); 
  }
};

router.get("/", isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    res.render("partials/layout.ejs", { body: "admin", users });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post(
  "/promote",
  (req, res, next) =>
    req.session.user && req.session.user.isAdmin
      ? next()
      : res.redirect("/login"),
  async (req, res) => {
    const { username } = req.body;
    try {
      const user = await User.findOne({ username });

      if (user) {
        user.isAdmin = true;
        await user.save();
      }

      res.redirect("/admin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

router.post(
  "/demote",
  (req, res, next) =>
    req.session.user && req.session.user.isAdmin
      ? next()
      : res.redirect("/login"),
  async (req, res) => {
    const { username } = req.body;
    try {
      const user = await User.findOne({ username });

      if (user) {
        user.isAdmin = false;
        await user.save();
      }

      res.redirect("/admin");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;

const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  // Destroy the session to log out the user
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    }
    // Redirect to the home page or login page after logout
    res.redirect("/");
  });
});

module.exports = router;

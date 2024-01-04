const express = require("express");
const router = express.Router();
const Image = require("../models/image");
router.get("/", async (req, res) => {
  try {
    const images = await Image.find()
      .sort({ createdAt: -1 })
      .limit(10);
    res.render("partials/layout.ejs", { body: "home", images, page:1 });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/page/:page?", async (req, res) => {
  try {
    const perPage = 10;
    const page = req.params.page || 1;
    const images = await Image.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    res.render("partials/layout.ejs", { body: "home", images, page });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

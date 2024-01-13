const express = require("express");
const router = express.Router();
const Image = require("../models/image");
router.get("/", async (req, res) => {
  try {
    const postsLoad = await Image.find()
      .sort({ createdAt: -1 })
      .limit(10);
    const posts = postsLoad.map((doc) => {
      const updatedDoc = { ...doc.toObject() };
      updatedDoc._id = doc._id.toString();
      return updatedDoc;
    });
    res.render("partials/layout.ejs", { body: "home", posts, page: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.get("/page/:page?", async (req, res) => {
  try {
    const perPage = 10;
    const page = req.params.page || 1;
    const postsLoad = await Image.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    const posts = postsLoad.map((doc) => {
      const updatedDoc = { ...doc.toObject() };
      updatedDoc._id = doc._id.toString();
      return updatedDoc;
    });
    res.render("partials/layout.ejs", { body: "home", posts, page });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

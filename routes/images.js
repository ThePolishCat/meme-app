const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Image = require("../models/image");
const { v4: uuidv4 } = require("uuid");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const isUser = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.errorMessage = "You are not authorized. Please log in.";
    req.session.returnTo = req.originalUrl;
    res.redirect("/login");
  }
};

// Render the image upload form
router.get("/upload", isUser, (req, res) => {
  res.render("partials/layout.ejs", { body: "image-upload" });
});

// Handle image upload
router.post("/upload", isUser, upload.single("image"), async (req, res) => {
  const { title } = req.body;
  const imagePath = `/uploads/${req.file.filename}`;
  const newImage = new Image({ title, path: imagePath, id: uuidv4() });
  await newImage.save();
  res.render("partials/layout.ejs", {
    body: "image-success",
    imagePath,
    title,
  });
});

router.post("/vote", async (req, res) => {
  const { imageId, vote } = req.body;
  try {
    const image = await Image.findOne({ id: imageId });

    if (!image) {
      return res.status(404).send("Image not found");
    }

    if (vote === "plus") {
      // Handle upvote logic
      image.upvotes = (image.upvotes || 0) + 1;
    } else if (vote === "minus") {
      // Handle downvote logic
      image.downvotes = (image.downvotes || 0) + 1;
    }

    await image.save();
    res.status(200).json({ upvotes: image.upvotes, downvotes: image.downvotes });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;

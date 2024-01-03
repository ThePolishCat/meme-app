const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Image = require("../models/image");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Set the upload destination folder
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    ); // Set the file name
  },
});

const upload = multer({ storage: storage });

const isUser = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.session.errorMessage = 'You are not authorized. Please log in.';
    req.session.returnTo = req.originalUrl
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
  const newImage = new Image({ title, path: imagePath });
  await newImage.save();
  res.render("partials/layout.ejs", { body: "image-success", imagePath });
});

module.exports = router;

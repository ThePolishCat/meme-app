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
  try {
    const { imageId, vote } = req.body;
    const userId = req.session.user._id;

    // Check if the user has already voted for this image
    const hasVoted = await Image.exists({
      _id: imageId,
      voters: userId,
    });

    if (!hasVoted) {
      // Update vote counts and add user to the voters array
      const update = {
        $inc: { [vote === "plus" ? "upvotes" : "downvotes"]: 1 },
        $push: { voters: userId },
      };

      const updatedImage = await Image.findByIdAndUpdate(imageId, update, {
        new: true,
      });

      res.json({
        upvotes: updatedImage.upvotes,
        downvotes: updatedImage.downvotes,
      });
    } else {
      const update = {
        $inc: { [vote === "plus" ? "upvotes" : "downvotes"]: 1 },
        $inc: { [vote === "plus" ? "downvotes" : "upvotes"]: -1 },
        $push: { voters: userId },
      };

      const updatedImage = await Image.findByIdAndUpdate(imageId, update, {
        new: true,
      });

      res.json({
        upvotes: updatedImage.upvotes,
        downvotes: updatedImage.downvotes,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

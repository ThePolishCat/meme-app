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
    const { postId, vote } = req.body;
    const userId = req.session.user._id;
    const post = await Image.findOne({ id: postId });
    if (!post) {
      return res.status(404).send("Post not found");
    }

    const hasVoted = await Image.exists({
      id: postId,
      voters: { $elemMatch: { userId: userId } },
    });
    if (!hasVoted) {
      post.upvotes += vote === "plus" ? 1 : 0;
      post.downvotes += vote === "minus" ? 1 : 0;
      post.voters.push({ userId, vote });
      post.save();

      res.json({
        upvotes: post.upvotes,
        downvotes: post.downvotes,
      });
    } else {
      if (
        vote === post.voters.find((voter) => voter.userId.equals(userId)).vote
      ) {
        return res.json({
          upvotes: post.upvotes,
          downvotes: post.downvotes,
        });
      } else {
        post.upvotes += vote === "plus" ? 1 : -1;
        post.downvotes += vote === "minus" ? 1 : -1;
        post.voters.find((voter) => voter.userId.equals(userId)).vote = vote;
        post.save();
        res.json({
          upvotes: post.upvotes,
          downvotes: post.downvotes,
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;

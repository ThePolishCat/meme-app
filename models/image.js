const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  upvotes:{
    type: Number,
    default: 0
  },
  downvotes:{
    type: Number,
    default: 0
  },
  voters: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      vote: {
        type: String,
        enum: ["plus", "minus"], // Enum to restrict the values to 'plus' or 'minus'
        required: true,
      },
    },
  ],
});

postSchema.statics.deleteById = async function (imageId) {
  const image = await this.findOne({ id: imageId });
  if (!image) {
    throw new Error("Image not found");
  }
  const imagePath = path.join(__dirname, "..", "public", image.path);
  fs.unlinkSync(imagePath);
  return this.deleteOne({ id: imageId });
};

module.exports = mongoose.model("Image", postSchema);

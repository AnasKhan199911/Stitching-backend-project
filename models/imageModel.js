const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  datasetName: {
    type: String,
    required: true,
  },
  images: [
    {
      filename: { type: String, required: true },
      public_id: { type: String, required: true },
      url : { type: String }
    },
  ],
  liked: {
    type: Boolean,
    default: false,
  },
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Image", imageSchema);

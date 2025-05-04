const Image = require("../models/imageModel");
const fs = require("fs");
const path = require("path");
const cloudinary = require('cloudinary').v2;
const { Types } = require("mongoose");

exports.uploadImages = async (req, res) => {
  const userId = req.user; // Must be set by auth middleware

  if (!req.body?.datasetName) {
    return res.status(400).json({ message: "Dataset name is required." });
  }

  const { datasetName } = req.body;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "Dataset name and images are required." });
  }

  try {
    // Optional: check for duplicate dataset name
    const existingDataset = await Image.findOne({ userId, datasetName });
    if (existingDataset) {
      return res.status(400).json({ message: "Dataset with this name already exists." });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `datasets/${userId}/${datasetName}`, // Optional folder structure
      });

      uploadedImages.push({
        url: result.secure_url,
        filename: result.original_filename,
        public_id: result.public_id,
      });
    }

    const newDataset = new Image({
      userId: userId,
      datasetName,
      images: uploadedImages,
    });

    await newDataset.save();

    res.status(201).json({
      message: "Images uploaded successfully",
      dataset: newDataset,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
};



// Get History of User Datasets
exports.getHistory = async (req, res) => {
  const userId = req.user;
  try {
    const history = await Image.aggregate([
      { $match: { userId:new Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$datasetName",
          count: { $sum: 1 },
          latest: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$latest" }
      }
    ]);
    ``

    res.status(200).json({ history });
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ message: "Error fetching history", error: error.message });
  }
};

// View Specific Dataset with Full Image Data
exports.viewImage = async (req, res) => {
  const { imageId } = req.params;

  try {
    const dataset = await Image.findById(imageId).populate("user", "email");

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    res.status(200).json({ dataset });
  } catch (error) {
    console.error("View error:", error);
    res.status(500).json({ message: "Error viewing dataset", error: error.message });
  }
};

// (Optional) Start Stitching — Stub until algorithm API is connected
exports.startStitching = async (req, res) => {
  const { datasetId } = req.body;

  try {
    const dataset = await Image.findById(datasetId);

    if (!dataset) {
      return res.status(404).json({ message: "Dataset not found" });
    }

    // Placeholder logic for stitching
    // Later you can send dataset.images to Python API or pipeline
    res.status(202).json({ message: "Stitching started", datasetId });
  } catch (error) {
    console.error("Stitching error:", error);
    res.status(500).json({ message: "Error starting stitching", error: error.message });
  }
};

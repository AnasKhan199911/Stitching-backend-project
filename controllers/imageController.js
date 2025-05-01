const Image = require("../models/Image");
const fs = require("fs");
const path = require("path");

// Upload Images & Create Dataset
exports.uploadImages = async (req, res) => {
  const userId = req.user._id; // Must be set by auth middleware
  const { datasetName } = req.body;

  if (!datasetName || req.files.length === 0) {
    return res.status(400).json({ message: "Dataset name and images are required." });
  }

  try {
    const images = req.files.map(file => ({
      filename: file.filename,
      path: file.path,
    }));

    const newDataset = new Image({
      user: userId,
      datasetName,
      images,
    });

    await newDataset.save();

    res.status(201).json({ message: "Images uploaded successfully", dataset: newDataset });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading images", error: error.message });
  }
};

// Get History of User Datasets
exports.getHistory = async (req, res) => {
  const userId = req.user._id;

  try {
    const history = await Image.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("datasetName liked createdAt");

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

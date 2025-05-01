const express = require("express");
const router = express.Router();
const multer = require("multer");
const authenticate = require("../middleware/authMiddleware.js"); // Make sure the path is correct
const {
  uploadImages,
  startStitching,
  getHistory,
  viewImage
} = require("../controllers/imageController");

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/"); // Make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "_" + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per image
});

// Routes
router.post("/upload", authenticate, upload.array("images", 10), uploadImages);
router.post("/start-stitching", authenticate, startStitching);
router.get("/history", authenticate, getHistory);
router.get("/view/:imageId", authenticate, viewImage);

module.exports = router;

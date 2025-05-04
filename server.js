const express = require("express");
const session = require("express-session");
const passport = require("passport");
const mongoose = require("mongoose");
 require("dotenv").config(); // Load environment variables

const app = express();
const port = 5000;

// MongoDB Connection URI
const dbURI = "mongodb+srv://Alizain-Merchant:ali123ali@cluster-1.mcik1.mongodb.net/myAppDatabase?retryWrites=true&w=majority";

// Connect to MongoDB
mongoose.connect(dbURI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// Middleware to parse JSON from requests
app.use(express.json());

// Session and Passport initialization
app.use(session({ secret: "your-secret", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/image", require("./routes/imageRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Home route after Google login (for testing)
app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(`<h1>Welcome, ${req.user.name}!</h1><p>Email: ${req.user.email}</p>`);
  } else {
    res.redirect("/login");
  }
});

// Login failure fallback
app.get("/login", (req, res) => {
  res.send("<h1>Login Failed</h1><p>Please try logging in again.</p>");
});

app.get("/", (req, res) => {
  res.send("<h1>Welcome to the Home Page</h1>");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});

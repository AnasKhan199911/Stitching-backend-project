const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const signUp = async (req, res) => {
    const { email, password, name } = req.body; // <-- name bhi add kia
  
    try {
      if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required" });
      }
  
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword, name }); // <-- name pass kia
  
      await newUser.save();
  
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      console.error("Signup error:", err);
      res.status(500).json({ 
        message: "Error creating user", 
        error: err.message || "Unknown error" 
      });
    }
  };
  

// SIGNIN
const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ 
      message: "User signed in successfully", 
      token 
    });

  } catch (err) {
    console.error("Signin error:", err);
    res.status(500).json({ 
      message: "Error signing in", 
      error: err.message || "Unknown error" 
    });
  }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const resetLink = `http://localhost:5000/api/auth/reset-password/${email}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // environment variable mein rakho
        pass: process.env.EMAIL_PASS, // environment variable mein rakho
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Click the following link to reset your password: ${resetLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({ message: "Error sending email", error: error.message });
      }
      res.status(200).json({ message: "Password reset link sent to your email" });
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ 
      message: "Error in reset password", 
      error: err.message || "Unknown error" 
    });
  }
};

module.exports = { signUp, signIn, resetPassword };

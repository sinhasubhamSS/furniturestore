import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.models";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { sendTokenResponse } from "../utils/auth/sendToken";
import { clearAuthCookies } from "../utils/auth/cookieHelper";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const file = req.file;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let avatarUrl = "";
    if (file) {
      const result = await uploadToCloudinary(file.buffer, "avatars");
      avatarUrl = result.secure_url;
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      avatar: avatarUrl,
    });

    await newUser.save();
   

    // Send token response
    sendTokenResponse(res, newUser._id.toString(), "Registration successful", {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    console.log("Login Attempt:", email, password);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("No user found with this email");
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    sendTokenResponse(res, user._id.toString(), "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    clearAuthCookies(res);
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
};

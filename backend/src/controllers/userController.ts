import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.models";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

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

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

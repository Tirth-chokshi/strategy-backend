import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./../models/Strategy";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = "secret";

interface IUserCreate {
  email: string;
  password: string;
  name: string;
}

interface IUserUpdate {
  email?: string;
  password?: string;
  name?: string;
}
// Create new user
export async function createUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userData: IUserCreate = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create new user
    const newUser = new User({
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
    });

    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject() as IUserUpdate;
    delete userResponse.password;

    return res.status(201).json({
      success: true,
      data: userResponse,
      message: "User created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Update user
export async function updateUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.params.id;
    const updateData: IUserUpdate = req.body;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    // Hash new password if provided
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Check if email is being updated and is unique
    if (updateData.email) {
      const existingUser = await User.findOne({
        email: updateData.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Delete user
export async function deleteUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const userId = req.params.id;

    // Validate ObjectId
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Login user
export async function loginUser(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Match password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    // const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    //   expiresIn: JWT_EXPIRES_IN,
    // });

    const token = jwt.sign(
        { userId: user._id },
        JWT_SECRET,
        { expiresIn: "12h" } 
    );
    // Return token
    return res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error logging in user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

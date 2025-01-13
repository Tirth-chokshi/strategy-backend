import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import { User } from "./../models/Strategy";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer, { TransportOptions } from "nodemailer";
dotenv.config();

const JWT_SECRET = "hi";
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
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "12h",
    });
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

// Forgot Password
export async function forgotPassword(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save();


    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    } as TransportOptions);

    const resetUrl = `${process.env.FRONTEND_URL}/reset/${resetToken}`;
    const mailOptions = {
      to: user.email,
      from: process.env.SMTP_USER,
      subject: "Password Reset",
      text:
        `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
        `Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:\n\n` +
        `${resetUrl}\n\n` +
        `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error sending email", error });
  }
}

// Reset Password
export async function resetPassword(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Password reset token is invalid or has expired.",
        });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password has been reset." });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error resetting password", error });
  }
}

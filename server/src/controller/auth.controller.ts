import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { User } from "../types/auth.";
import { prisma } from "../prisma/prismaClient";


// JWT helper
const generateAuthToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set in env variables");
  return jwt.sign({ id: userId }, secret, { expiresIn: "1d" });
};

// Password check helper
const checkPassword = (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// Registration controller
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, bio, fullName }: Partial<User> = req.body;

    // Validate required fields
    if (!email || !password || !bio || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        bio,
        fullName,
      },
    });

    // Generate JWT token
    const token = generateAuthToken(user.id);
    res.cookie("authToken", token, { httpOnly: true });

    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: Partial<User> = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await checkPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateAuthToken(user.id);
    res.cookie("authToken", token, { httpOnly: true });

    res.status(200).json({ user, token });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie("authToken");
  res.status(200).json({ message: "Logout successful" });
};


export const forgetPassword = async (req: Request, res: Response) => {
  try {
    const { email }: Partial<User> = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate JWT token
    const token = generateAuthToken(user.id);
    res.cookie("authToken", token, { httpOnly: true });

    res.status(200).json({ user, token });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};






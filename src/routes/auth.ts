import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { handleError } from "../utils/ApiResponseHandler";

const router = Router();

// Generate JWT Token
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: "30d",
  });
};

// User Signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User already exists",
        message: "A user with this email already exists"
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// User Signin
router.post("/signin", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        message: "Email or password is incorrect"
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
        message: "Email or password is incorrect"
      });
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
        },
        token,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
});

// Get current user profile
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "Please provide a valid token"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any;
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "User not found"
      });
    }

    res.json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    return handleError(res, error);
  }
});

export default router;

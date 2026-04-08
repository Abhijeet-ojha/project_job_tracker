import { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = registerSchema.parse(req.body);
    
    // Check if user exists
    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create user
    const user = await User.create({
      email: validatedData.email,
      password: validatedData.password, 
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: error.issues[0].message });
      return;
    }
    console.error('Register User Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login User Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

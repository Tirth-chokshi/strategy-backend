import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/Strategy';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET ="hi"

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        // Add user to request object
        (req as any).user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};
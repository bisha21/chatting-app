import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/prismaClient';

export const isUserLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawToken = req.headers.authorization;
    let token: string | undefined;

    if (rawToken?.startsWith('Bearer ')) {
      token = rawToken.split(' ')[1];
    } else if (req.cookies?.authToken) {
      token = req.cookies.authToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    let decodedToken: jwt.JwtPayload & { id: number };
    try {
      decodedToken = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as jwt.JwtPayload & { id: number };
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(401).json({ message: err.message });
    }

    const userData = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userData) {
      return res.status(401).json({ message: 'User not found' });
    }

    // @ts-ignore
    req.user = {
      id: userData.id,
      email: userData.email,
    };

    next();
  } catch (error: any) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

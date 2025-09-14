import express from 'express';
import { register, login } from '../controller/auth.controller';
import { prisma } from '../prisma/prismaClient';
import { isUserLogin } from '../middleware/protectedRoutes';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', isUserLogin, async (req, res) => {
  // @ts-ignore
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export default router;

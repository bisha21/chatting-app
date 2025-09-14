import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // if you use cookies/JWTs
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'hello world' });
});

export default app;

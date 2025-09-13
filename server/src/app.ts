import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'hello world' });
});

export default app;

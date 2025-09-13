import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app= express();
app.get('/', (req:Request, res:Response) => {
    res.json({message: 'hello world'})
})


export default app
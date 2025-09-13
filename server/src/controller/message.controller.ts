import { Request, Response } from 'express';
import { prisma } from '../prisma/prismaClient';
import { Message } from '../types/message';
import { userSocketMap,io } from '../../server';

export const getUserForSideBar = async (req: Request, res: Response) => {
  try {
    //   @ts-ignore
    const userId = req.user.id;
    const filterUser = await prisma.user.findMany({
      where: { id: { not: userId } },
    });

    const unSeenMessage = {};
    const promises = filterUser.map(async (user) => {
      const message = prisma.message.findMany({
        where: {
          senderId: user?.id,
          reciverId: userId,
        },
      });
      if ((await message).length > 0) {
        //   @ts-ignore
        unSeenMessage[user?.id] = (await message).length;
      }
    });
    await Promise.all(promises);
    res.json({
      sucess: 'true',
    });
  } catch (err: any) {
    console.log('internal server err', err?.message);
  }
};

export const getAllMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    // @ts-ignore (assuming you set req.user in auth middleware)
    const myId = req.user.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: Number(userId),
            reciverId: myId,
          },
          {
            senderId: myId,
            reciverId: Number(userId),
          },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const markMessageAsSeen = async (req: Request, res: Response) => {
  try {
    const messageId = req.params.id;
    await prisma.message.update({
      where: {
        id: Number(messageId),
      },
      data: {
        seen: true,
      },
    });
    res.status(200).json({ success: true });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  const { text, image }: Partial<Message> = req.body;
  // @ts-ignore
  const senderId = req.user?.id;
  const reciverId = req.params.id;
  const message = await prisma.message.create({
    data: {
      senderId,
      reciverId: Number(reciverId),
      text,
      image,
    },
  });
//   @ts-ignore
  const reciverSocketId=userSocketMap[reciverId];
  if(reciverSocketId)
  {
    io.to(reciverSocketId).emit('newMessage', message);
  }

  res.status(200).json({ success: true, message });
};

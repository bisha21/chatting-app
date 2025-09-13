import app from './src/app';
import { createServer } from 'http';
import { envConfig } from './src/config/config';
import { Server } from 'socket.io';

const port = envConfig.port || 5000;

// Create HTTP server with Express app
const server = createServer(app);

// Create Socket.IO server
export const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

export const userSocketMap = {};
// {userId: socketId}

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;

  console.log('a user connected',userId);
  if(userId)
  {
    // @ts-ignore
    userSocketMap[userId] = socket.id
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('user disconnected');
    // @ts-expect-error
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

// Start server
server.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});

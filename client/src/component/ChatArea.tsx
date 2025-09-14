import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Message, { type MessageType } from './Message';
import type { User } from '../context/AuthContext';

interface ChatAreaProps {
  selectedUser: User | null;
}

interface MessagesResponse {
  success: boolean;
  messages: MessageType[];
}

const ChatArea: React.FC<ChatAreaProps> = ({ selectedUser }) => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const { user } = useAuth();
  const { onlineUsers, socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('token');

  // ✅ Fetch conversation messages
  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.get<MessagesResponse>(
        `http://localhost:3000/api/message/${selectedUser.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessages(
        Array.isArray(response.data.messages) ? response.data.messages : []
      );
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  // ✅ Send message via API
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      const response = await axios.post(
        `http://localhost:3000/api/message/send/${selectedUser.id}`,
        { text: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Add the sent message immediately (optimistic UI)
      setMessages((prev) => [...prev, response.data.message]);

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // ✅ Mark message as seen
  const markMessageAsSeen = async (messageId: number) => {
    try {
      await axios.patch(
        `http://localhost:3000/api/message/mark/${messageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Error marking message as seen:', error);
    }
  };

  // ✅ Fetch messages when user is selected
  useEffect(() => {
    fetchMessages();
  }, [selectedUser]);

  // ✅ Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Listen for new messages via socket
  useEffect(() => {
    if (!socket || !selectedUser) return;

    const handleNewMessage = (message: MessageType) => {
      if (
        (message.senderId === selectedUser.id &&
          message.reciverId === user?.id) ||
        (message.reciverId === selectedUser.id && message.senderId === user?.id)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on('newMessage', handleNewMessage);
    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, selectedUser, user?.id]);

  // Helpers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewMessage(e.target.value);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  const isUserOnline = (userId: number) =>
    onlineUsers.includes(userId.toString());

  const isCurrentUserMessage = (message: MessageType) =>
    user?.id === message.senderId;

  // If no user is selected
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center animate-fade-in">
          <div className="relative mb-8">
            <MessageCircle className="w-24 h-24 text-gray-300 mx-auto animate-float" />
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-purple-500 rounded-full animate-ping"></div>
          </div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">
            Welcome to Your Chat
          </h3>
          <p className="text-gray-500 text-lg">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  // ✅ Chat UI
  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-purple-50 to-blue-50 animate-slide-in-right">
      {/* Chat Header */}
      <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4 animate-slide-down">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {selectedUser.fullName.charAt(0).toUpperCase()}
            </div>
            {isUserOnline(selectedUser.id) && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-xl">
              {selectedUser.fullName}
            </h2>
            <p className="text-sm text-gray-500">
              {isUserOnline(selectedUser.id) ? (
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              isOwn={isCurrentUserMessage(message)}
              onMarkAsSeen={markMessageAsSeen}
            />
          ))
        ) : (
          <div className="text-center text-gray-400 mt-10">
            No messages yet. Start the conversation!
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm animate-slide-up">
        <div className="flex space-x-4 items-end">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full p-4 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 bg-white/70 backdrop-blur-sm"
            />
            <Smile className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-purple-500 transition-colors duration-300" />
          </div>
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;

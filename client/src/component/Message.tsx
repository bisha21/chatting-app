import React from 'react';
import { Eye } from 'lucide-react';

// Types
export interface MessageType {
  id: number;
  text: string;
  senderId: number;
  reciverId: number;
  seen: boolean;
  createdAt: string;
}

interface MessageProps {
  message: MessageType;
  isOwn: boolean;
  onMarkAsSeen: (messageId: number) => void;
}

const Message: React.FC<MessageProps> = ({ message, isOwn, onMarkAsSeen }) => {
  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleMarkAsSeen = () => onMarkAsSeen(message.id);

  return (
    <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 transform hover:scale-105 ${
          isOwn
            ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
        <div
          className={`flex items-center justify-between mt-2 ${
            isOwn ? 'text-purple-100' : 'text-gray-500'
          }`}
        >
          <span className="text-xs">{formatTime(message.createdAt)}</span>
          {isOwn && (
            <Eye
              className={`w-3 h-3 ml-2 transition-colors duration-300 ${
                message.seen
                  ? 'text-purple-200'
                  : 'text-purple-300 animate-pulse'
              }`}
            />
          )}
          {!isOwn && !message.seen && (
            <button
              onClick={handleMarkAsSeen}
              className="text-xs text-purple-600 hover:text-purple-700 ml-2 transition-colors duration-300"
            >
              Mark as read
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;

import React from 'react';
import { motion } from 'framer-motion';
import { Message } from '../../types';

interface ChatMessageProps {
  message: Message;
  isLastMessage?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isLastMessage = false }) => {
  const isUser = message.type === 'user';
  const isSystem = message.type === 'system';
  const isAchievement = message.type === 'achievement';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : isSystem
            ? 'bg-gray-100 text-gray-700 border'
            : isAchievement
            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
            : 'bg-white border text-gray-800'
        }`}
      >
        {isAchievement && message.achievement && (
          <div className="flex items-center gap-2 mb-2">
            {message.achievement.icon && <span>{message.achievement.icon}</span>}
            <span className="font-semibold">{message.achievement.title}</span>
            {message.points && <span className="text-sm">+{message.points} pts</span>}
          </div>
        )}
        
        <div className="text-sm">
          {typeof message.content === 'string' ? message.content : message.content}
        </div>
        
        {message.points && !isAchievement && (
          <div className="text-xs mt-1 opacity-75">
            +{message.points} points earned
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
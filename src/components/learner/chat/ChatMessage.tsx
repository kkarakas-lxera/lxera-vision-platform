import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Trophy, Zap, Target } from 'lucide-react';

export type MessageType = 'bot' | 'user' | 'achievement' | 'challenge' | 'system';

interface ChatMessageProps {
  type: MessageType;
  content: string | React.ReactNode;
  timestamp?: Date;
  points?: number;
  achievement?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
  };
}

export default function ChatMessage({ 
  type, 
  content, 
  timestamp, 
  points,
  achievement 
}: ChatMessageProps) {
  const isBot = type === 'bot';
  const isUser = type === 'user';
  const isAchievement = type === 'achievement';
  const isChallenge = type === 'challenge';
  const isSystem = type === 'system';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full mb-4",
        isUser && "justify-end",
        (isAchievement || isSystem) && "justify-center"
      )}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div className="flex-shrink-0 mr-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">L</span>
          </div>
        </div>
      )}

      {/* Message Content */}
      <div className={cn(
        "max-w-[80%] lg:max-w-[70%]",
        isUser && "max-w-[80%]",
        (isAchievement || isSystem) && "max-w-full"
      )}>
        {/* Achievement Message */}
        {isAchievement && achievement && (
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-4 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              {achievement.icon || <Trophy className="h-8 w-8 text-yellow-600" />}
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
            {achievement.description && (
              <p className="text-sm text-gray-700">{achievement.description}</p>
            )}
            {points && (
              <p className="text-lg font-bold text-yellow-600 mt-2">+{points} points</p>
            )}
          </motion.div>
        )}

        {/* Challenge Message */}
        {isChallenge && (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 rounded-2xl p-4">
            <div className="flex items-center mb-2">
              <Zap className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-bold text-purple-900">Quick Challenge!</span>
            </div>
            <div>{content}</div>
          </div>
        )}

        {/* System Message */}
        {isSystem && (
          <div className="bg-gray-100 rounded-full px-4 py-2 text-center">
            <p className="text-sm text-gray-600">{content}</p>
          </div>
        )}

        {/* Regular Bot/User Message */}
        {(isBot || isUser) && !isAchievement && !isChallenge && (
          <div
            className={cn(
              "rounded-2xl px-4 py-3",
              isBot && "bg-gray-100 text-gray-900 rounded-tl-sm",
              isUser && "bg-blue-600 text-white rounded-tr-sm"
            )}
          >
            {typeof content === 'string' ? (
              <p className={cn(
                "text-sm leading-relaxed",
                isUser && "text-white"
              )}>
                {content}
              </p>
            ) : (
              content
            )}
            
            {/* Points indicator */}
            {points && points > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className={cn(
                  "text-xs mt-1 font-medium",
                  isBot ? "text-green-600" : "text-green-300"
                )}
              >
                +{points} points earned!
              </motion.div>
            )}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && !isAchievement && !isSystem && (
          <p className={cn(
            "text-xs text-gray-500 mt-1",
            isUser && "text-right"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </motion.div>
  );
}
import { Message } from '../types';
import { MESSAGE_DELAYS } from '../constants';

export class MessageService {
  static generateMessageId(prefix: string = 'msg'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static createBotMessage(content: string | React.ReactNode, points: number = 0): Message {
    return {
      id: this.generateMessageId('bot'),
      type: 'bot',
      content,
      timestamp: new Date(),
      points
    };
  }

  static createUserMessage(content: string): Message {
    return {
      id: this.generateMessageId('user'),
      type: 'user',
      content,
      timestamp: new Date()
    };
  }

  static createAchievementMessage(
    title: string, 
    points: number, 
    icon?: React.ReactNode, 
    description?: string
  ): Message {
    return {
      id: this.generateMessageId('achievement'),
      type: 'achievement',
      content: `🎉 ${title}`,
      timestamp: new Date(),
      points,
      achievement: {
        title,
        description,
        icon
      }
    };
  }

  static createSystemMessage(content: string | React.ReactNode, metadata?: any): Message {
    return {
      id: this.generateMessageId('system'),
      type: 'system',
      content,
      timestamp: new Date(),
      metadata
    };
  }

  static async addMessageWithDelay(
    messages: Message[],
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
    setIsTyping: (typing: boolean) => void,
    message: Message,
    delay: number = MESSAGE_DELAYS.response
  ): Promise<void> {
    if (delay > 0) {
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, delay));
      setIsTyping(false);
    }

    setMessages(prev => [...prev, message]);
  }

  static getQuickReplyMessage(
    replies: Array<{ label: string; value: string }>,
    onReply: (value: string) => void
  ): Message {
    return this.createSystemMessage(
      <div className="flex flex-wrap gap-2 mt-2">
        {replies.map((reply, index) => (
          <button
            key={index}
            onClick={() => onReply(reply.value)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            {reply.label}
          </button>
        ))}
      </div>,
      { type: 'quick_reply', replies }
    );
  }

  static sortMessagesByTimestamp(messages: Message[]): Message[] {
    return [...messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  static filterMessagesByType(messages: Message[], types: Message['type'][]): Message[] {
    return messages.filter(message => types.includes(message.type));
  }

  static getLastMessageOfType(messages: Message[], type: Message['type']): Message | null {
    const filtered = this.filterMessagesByType(messages, [type]);
    return filtered.length > 0 ? filtered[filtered.length - 1] : null;
  }
}
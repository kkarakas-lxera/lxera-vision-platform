import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  onFileUpload?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  suggestions?: string[];
}

export default function ChatInput({
  onSend,
  onFileUpload,
  placeholder = "Type your message...",
  disabled = false,
  isLoading = false,
  suggestions = []
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(file);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMessage(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Suggestions */}
      <AnimatePresence>
        {suggestions.length > 0 && !message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 border-b border-gray-100"
          >
            <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex items-end gap-2 p-4">
        {/* File Upload Button */}
        {onFileUpload && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.txt"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading}
              className={cn(
                "p-2 rounded-full transition-colors",
                "hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              title="Upload file"
            >
              <Paperclip className="h-5 w-5 text-gray-600" />
            </button>
          </>
        )}

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              "w-full px-4 py-2 pr-10 rounded-2xl border border-gray-300",
              "focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500",
              "resize-none transition-all duration-200",
              "disabled:bg-gray-50 disabled:cursor-not-allowed",
              "text-sm"
            )}
            style={{ minHeight: '40px' }}
          />
          
          {/* Character count */}
          {message.length > 100 && (
            <span className="absolute bottom-2 right-12 text-xs text-gray-400">
              {message.length}
            </span>
          )}
        </div>

        {/* Voice Input Button */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          disabled={disabled || isLoading}
          className={cn(
            "p-2 rounded-full transition-colors",
            isRecording ? "bg-red-100 text-red-600" : "hover:bg-gray-100",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          title={isRecording ? "Stop recording" : "Start recording"}
        >
          <Mic className={cn(
            "h-5 w-5",
            isRecording ? "animate-pulse" : "text-gray-600"
          )} />
        </button>

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isLoading}
          className={cn(
            "p-2 rounded-full transition-all duration-200",
            message.trim() && !disabled && !isLoading
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
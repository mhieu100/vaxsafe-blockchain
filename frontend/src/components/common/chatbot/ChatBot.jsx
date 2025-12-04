import { CloseOutlined, MessageOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Avatar, Button, Input, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import ragService from '@/services/rag.service';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I am the VaxSafe AI Assistant. How can I help you with vaccination information today?',
      sender: 'bot',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const chatMutation = useMutation({
    mutationFn: ragService.chat,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { id: Date.now(), text: data, sender: 'bot' }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 'Sorry, I encountered an error. Please try again later.',
          sender: 'bot',
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                <RobotOutlined className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base m-0 leading-tight">VaxSafe AI</h3>
                <span className="text-blue-100 text-xs flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Online
                </span>
              </div>
            </div>
            <Button
              type="text"
              icon={<CloseOutlined className="text-white text-lg" />}
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center"
            />
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                  <Spin size="small" />
                  <span className="text-slate-400 text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about vaccines..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={chatMutation.isPending}
                className="rounded-xl border-slate-200 hover:border-blue-400 focus:border-blue-500"
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={chatMutation.isPending}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 border-none shadow-lg shadow-blue-500/30"
              />
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400">
                AI can make mistakes. Please verify important information.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-110 ${
          isOpen ? 'bg-slate-700 rotate-90' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
        }`}
      >
        {isOpen ? (
          <CloseOutlined className="text-white text-xl" />
        ) : (
          <MessageOutlined className="text-white text-2xl animate-pulse" />
        )}

        {/* Notification Badge (Optional - can be dynamic later) */}
        {!isOpen && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default ChatBot;

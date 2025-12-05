import {
  ArrowLeftOutlined,
  CloseOutlined,
  MessageOutlined,
  RobotOutlined,
  SendOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ragService from '@/services/rag.service';
import useAccountStore from '@/stores/useAccountStore';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý AI VaxSafe. Tôi có thể giúp gì cho bạn về tiêm chủng hôm nay?',
      sender: 'bot',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const { user, isAuthenticated } = useAccountStore();

  // Medical Profile State
  const [profile, setProfile] = useState({
    age: '',
    vaccinationHistory: '',
    healthCondition: '',
  });

  // Auto-fill profile from user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      let ageString = '';
      if (user.birthday) {
        const birthDate = dayjs(user.birthday);
        const now = dayjs();
        const years = now.diff(birthDate, 'year');
        const months = now.diff(birthDate, 'month');

        if (years > 0) {
          ageString = `${years} tuổi`;
        } else {
          ageString = `${months} tháng`;
        }
      }

      setProfile((prev) => ({
        ...prev,
        age: ageString || prev.age,
        // We could fetch vaccination history from backend here if available
      }));
    }
  }, [isAuthenticated, user]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isSettingsOpen]);

  const chatMutation = useMutation({
    mutationFn: (data) => ragService.consult(data),
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { id: Date.now(), text: data, sender: 'bot' }]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: 'Xin lỗi, tôi gặp sự cố. Vui lòng thử lại sau.',
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

    // Prepare data for consult API
    const consultData = {
      query: inputValue,
      age: profile.age,
      vaccinationHistory: profile.vaccinationHistory
        ? profile.vaccinationHistory.split(',').map((s) => s.trim())
        : [],
      healthCondition: profile.healthCondition,
    };

    chatMutation.mutate(consultData);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end">
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
            <div className="flex gap-1">
              <Button
                type="text"
                icon={
                  isSettingsOpen ? (
                    <ArrowLeftOutlined className="text-white text-lg" />
                  ) : (
                    <SettingOutlined className="text-white text-lg" />
                  )
                }
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-white"
              />
              <Button
                type="text"
                icon={<CloseOutlined className="text-white text-lg" />}
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center"
              />
            </div>
          </div>

          {/* Content Area */}
          {isSettingsOpen ? (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <h4 className="font-bold text-slate-700 mb-4">Hồ sơ sức khỏe</h4>
              <p className="text-xs text-slate-500 mb-4">
                Cung cấp thông tin để AI tư vấn chính xác hơn.
              </p>

              <Form layout="vertical">
                <Form.Item label="Tuổi của bé/bạn">
                  <Input
                    placeholder="Ví dụ: 2 tháng, 5 tuổi..."
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                  />
                </Form.Item>
                <Form.Item label="Lịch sử tiêm chủng (cách nhau bởi dấu phẩy)">
                  <Input.TextArea
                    placeholder="Ví dụ: Lao, Viêm gan B sơ sinh..."
                    rows={3}
                    value={profile.vaccinationHistory}
                    onChange={(e) => setProfile({ ...profile, vaccinationHistory: e.target.value })}
                  />
                </Form.Item>
                <Form.Item label="Tình trạng sức khỏe hiện tại">
                  <Input
                    placeholder="Ví dụ: Bình thường, Đang sốt..."
                    value={profile.healthCondition}
                    onChange={(e) => setProfile({ ...profile, healthCondition: e.target.value })}
                  />
                </Form.Item>
                <Button type="primary" block onClick={() => setIsSettingsOpen(false)}>
                  Lưu & Quay lại chat
                </Button>
              </Form>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm overflow-hidden ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                      }`}
                    >
                      <div
                        className={`prose prose-sm max-w-none break-words ${
                          msg.sender === 'user'
                            ? 'prose-invert prose-p:text-white prose-headings:text-white prose-strong:text-white'
                            : 'prose-slate'
                        } prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-headings:my-2`}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex items-center gap-2">
                      <Spin size="small" />
                      <span className="text-slate-400 text-xs">Đang suy nghĩ...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Hỏi về vaccine..."
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
                    AI có thể mắc lỗi. Vui lòng kiểm tra lại thông tin quan trọng.
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        type="button"
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

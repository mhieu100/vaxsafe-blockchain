import {
  ArrowLeftOutlined,
  ArrowsAltOutlined,
  CloseOutlined,
  SendOutlined,
  SettingOutlined,
  ShrinkOutlined,
} from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { Button, Form, Input, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import modelImage from '@/assets/model.png';
import ragService from '@/services/rag.service';
import useAccountStore from '@/stores/useAccountStore';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý AI VaxSafe. Tôi có thể giúp gì cho bạn về tiêm chủng hôm nay?',
      sender: 'bot',
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  const { user, isAuthenticated, updateUserInfo } = useAccountStore();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    age: '',
    vaccinationHistory: '',
    healthCondition: '',
  });

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

  const suggestedQuestions = [
    'Lịch tiêm chủng cho trẻ sơ sinh?',
    'Vắc xin cúm giá bao nhiêu?',
    'Tác dụng phụ của vắc xin 6 trong 1?',
    'Hướng dẫn đặt lịch',
  ];

  const handleSend = (text = inputValue) => {
    if (!text.trim()) return;

    if (text === 'Hướng dẫn đặt lịch') {
      setIsOpen(false);
      updateUserInfo({ isNewUser: true });
      navigate('/');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: text,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);

    const consultData = {
      query: text,
      age: profile.age,
      vaccinationHistory: profile.vaccinationHistory
        ? profile.vaccinationHistory.split(',').map((s) => s.trim())
        : [],
      healthCondition: profile.healthCondition,
    };

    chatMutation.mutate(consultData);
    if (text === inputValue) setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Show upon mount after delay
    const initialTimer = setTimeout(() => setShowTooltip(true), 3000);
    const initialHide = setTimeout(() => setShowTooltip(false), 8000);

    // Show periodically every 60 seconds
    const interval = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 60000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(initialHide);
      clearInterval(interval);
    };
  }, []);

  return (
    <div id="tour-chatbot" className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end">
      {}
      {isOpen && (
        <div
          className={`${
            isExpanded
              ? 'fixed inset-0 z-[2010] w-full h-full rounded-none m-0'
              : 'mb-4 w-[350px] sm:w-[400px] h-[500px] rounded-2xl border border-slate-100'
          } bg-white shadow-2xl flex flex-col overflow-hidden animate-fade-in-up transition-all duration-300 ease-in-out`}
        >
          {}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1 rounded-full backdrop-blur-sm">
                <img src={modelImage} alt="AI" className="w-8 h-8 rounded-full object-cover" />
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
                  isExpanded ? (
                    <ShrinkOutlined className="text-white text-lg" />
                  ) : (
                    <ArrowsAltOutlined className="text-white text-lg" />
                  )
                }
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center text-white"
              />
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

          {}
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
              {}
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
                {messages.length === 1 && (
                  <div className="flex flex-wrap gap-2 mt-4 px-2">
                    {suggestedQuestions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => handleSend(q)}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-100 hover:bg-blue-100 transition-colors text-left"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {}
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
                    onClick={() => handleSend()}
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

      {}
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {!isOpen && (showTooltip || isHovered) && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap">
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl rounded-tr-none shadow-lg animate-fade-in text-sm font-medium relative">
              Chào bạn tôi là trợ lý AI
              <div
                className="absolute top-0 -right-2 w-0 h-0 
                border-t-[8px] border-t-blue-600 
                border-r-[8px] border-r-transparent"
              />
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center w-16 h-16 rounded-full shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-110 ${
            isOpen ? 'bg-slate-700 rotate-90' : 'bg-white border-2 border-blue-500 p-0.5'
          }`}
        >
          {isOpen ? (
            <CloseOutlined className="text-white text-xl" />
          ) : (
            <img src={modelImage} alt="Chat" className="w-full h-full rounded-full object-cover" />
          )}

          {!isOpen && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatBot;

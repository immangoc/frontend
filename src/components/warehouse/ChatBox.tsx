import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Phone, Mail, Headphones } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  time: string;
}

const botResponses: Record<string, string> = {
  default: 'Xin chào! Tôi là trợ lý ảo của Hùng Thủy. Tôi có thể giúp gì cho bạn?',
  xin_chao: 'Chào bạn! Công ty Vận tải Cảng biển Hùng Thủy rất vui được phục vụ bạn. Bạn cần hỗ trợ về dịch vụ nào?',
  dich_vu: 'Chúng tôi cung cấp các dịch vụ:\n• Quản lý kho bãi container\n• Vận chuyển hàng hóa đường biển\n• Thủ tục hải quan\n• Logistics tích hợp\n\nBạn quan tâm đến dịch vụ nào?',
  lien_he: 'Thông tin liên hệ:\n📞 Hotline: 1900-HUNG-THUY\n📧 Email: info@hungthuy.com\n🏢 Địa chỉ: Khu Cảng Cát Lái, Q.2, TP.HCM\n\nHoặc bạn có thể điền form liên hệ trên website.',
  gia: 'Để nhận báo giá chính xác, vui lòng liên hệ phòng kinh doanh:\n📞 028-3944-5678\n📧 sales@hungthuy.com\n\nChúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.',
  theo_doi: 'Để theo dõi container, bạn cần:\n1. Đăng nhập vào hệ thống\n2. Vào mục "Quản lý Container"\n3. Nhập số container\n\nBạn đã có tài khoản chưa?',
  dang_ky: 'Bạn có thể đăng ký tài khoản tại:\n👉 /warehouse/register\n\nSau khi đăng ký, đội ngũ của chúng tôi sẽ kích hoạt tài khoản và hỗ trợ bạn.',
};

function getResponse(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('chào') || t.includes('hello') || t.includes('hi')) return botResponses.xin_chao;
  if (t.includes('dịch vụ') || t.includes('service')) return botResponses.dich_vu;
  if (t.includes('liên hệ') || t.includes('contact') || t.includes('số điện thoại') || t.includes('địa chỉ')) return botResponses.lien_he;
  if (t.includes('giá') || t.includes('báo giá') || t.includes('chi phí') || t.includes('phí')) return botResponses.gia;
  if (t.includes('theo dõi') || t.includes('tracking') || t.includes('container')) return botResponses.theo_doi;
  if (t.includes('đăng ký') || t.includes('register') || t.includes('tài khoản')) return botResponses.dang_ky;
  return 'Cảm ơn bạn đã liên hệ! Để được hỗ trợ tốt hơn, vui lòng gọi hotline: 📞 1900-HUNG-THUY hoặc email: info@hungthuy.com. Chúng tôi sẽ phản hồi ngay!';
}

const quickReplies = ['Dịch vụ cung cấp', 'Báo giá', 'Theo dõi container', 'Liên hệ'];

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: 'Xin chào! Tôi là trợ lý ảo của **Hùng Thủy**. Tôi có thể giúp gì cho bạn? 👋',
      sender: 'bot',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const botMsg: Message = {
      id: Date.now() + 1,
      text: getResponse(text),
      sender: 'bot',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ height: '480px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Hỗ trợ Hùng Thủy</div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-blue-200 text-xs">Đang hoạt động</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href="tel:19001234" className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Phone className="w-4 h-4 text-white" />
                </a>
                <a href="mailto:info@hungthuy.com" className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
                  <Mail className="w-4 h-4 text-white" />
                </a>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === 'bot' ? 'bg-blue-900' : 'bg-gray-400'
                  }`}>
                    {msg.sender === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === 'bot'
                        ? 'bg-white text-gray-800 shadow-sm rounded-tl-sm'
                        : 'bg-blue-900 text-white rounded-tr-sm'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-xs text-gray-400">{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-end"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto">
              {quickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => sendMessage(reply)}
                  className="flex-shrink-0 text-xs px-3 py-1.5 border border-blue-200 text-blue-700 rounded-full hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-100 flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-9 h-9 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-200 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-600 hover:from-blue-800 hover:to-blue-500 rounded-full shadow-2xl flex items-center justify-center relative"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
        {/* Notification dot */}
        {!isOpen && (
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white text-xs font-bold">1</span>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

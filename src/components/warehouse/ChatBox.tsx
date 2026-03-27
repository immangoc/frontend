import { useState, useRef, useEffect, useMemo, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Phone, Mail, Headphones } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  time: string;
}

type RecipientType = 'customer' | 'dispatcher' | 'warehouse';

type DemoCustomer = { id: string; name: string };
const demoCustomers: DemoCustomer[] = [
  { id: 'u-customer', name: 'Phạm Thị Lan' },
  { id: 'u-customer-2', name: 'Trần Anh Tuấn' },
  { id: 'u-customer-3', name: 'Nguyễn Thị Mai' },
];

const botResponses = {
  customer: {
    default: 'Xin chào! Tôi là trợ lý ảo Hùng Thủy. Bạn cần hỗ trợ về đơn hàng/container nào?',
    hello: 'Chào bạn! Mình có thể giúp tra cứu, cập nhật trạng thái hoặc hướng dẫn thao tác trong hệ thống.',
    schedule: 'Nếu bạn cần theo dõi lịch trình, hãy cho mình biết mã container hoặc tên hãng tàu.',
    broken: 'Hiện hệ thống ghi nhận một số container có dấu hiệu hỏng. Bạn muốn kiểm tra theo container hay theo loại hàng?',
    storage: 'Bạn muốn xem tồn kho theo zone hay theo loại container?',
  },
  dispatcher: {
    default: 'Chào anh/chị, tôi là trợ lý điều phối. Mình có thể hỗ trợ xem lịch & tình trạng xuất/nhập theo ngày.',
    hello: 'Điều phối đã sẵn sàng. Anh/chị muốn kiểm tra lịch nhập hay lịch xuất?',
    schedule: 'Anh/chị cho mình biết khoảng thời gian (từ/ngày đến/ngày) để tổng hợp.',
    broken: 'Có một vài cảnh báo liên quan hàng hỏng. Mình có thể tổng hợp theo loại hàng để anh/chị duyệt.',
    storage: 'Tồn kho theo zone có thể xem trong báo cáo/thống kê. Anh/chị cần khoảng thời gian nào?',
  },
  warehouse: {
    default: 'Chào anh/chị, tôi là trợ lý kho. Mình có thể hỗ trợ kiểm tra tồn kho, khu vực và trạng thái container.',
    hello: 'Kho đã sẵn sàng. Anh/chị muốn xem tồn kho theo zone hay theo loại container?',
    schedule: 'Để lên lịch thao tác, mình cần khung thời gian và khu vực (A/B/C/D).',
    broken: 'Về hàng hỏng: mình có thể lọc những container có cảnh báo để đội kiểm tra xử lý.',
    storage: 'Anh/chị muốn xem tồn kho theo khu vực hay theo loại hàng?',
  },
} as const;

function getResponse(text: string, recipient: RecipientType, customerName?: string): string {
  const t = text.toLowerCase();
  const dict = recipient === 'customer' ? botResponses.customer : recipient === 'dispatcher' ? botResponses.dispatcher : botResponses.warehouse;

  if (t.includes('chào') || t.includes('hello') || t.includes('hi')) return dict.hello;
  if (t.includes('lịch') || t.includes('schedule') || t.includes('xuất') || t.includes('nhập')) return dict.schedule;
  if (t.includes('hỏng') || t.includes('broken') || t.includes('phạt') || t.includes('đền')) return dict.broken;
  if (t.includes('tồn') || t.includes('kho') || t.includes('storage')) return dict.storage;

  if (recipient === 'customer' && customerName) {
    return `${dict.default}\n\nKhi cần, bạn có thể nhắn: “Kiểm tra container của ${customerName}”.`;
  }
  return dict.default;
}

function quickRepliesFor(recipient: RecipientType, customerName?: string) {
  if (recipient === 'dispatcher') return ['Kiểm tra lịch nhập', 'Kiểm tra lịch xuất', 'Tổng hợp hàng hỏng', 'Báo cáo tồn kho'];
  if (recipient === 'warehouse') return ['Xem tồn kho theo zone', 'Lọc container hàng hỏng', 'Thông tin giao ca', 'Kiểm tra lệnh xuất'];
  return [`Kiểm tra trạng thái container của ${customerName || 'tôi'}`, 'Theo dõi lịch trình', 'Báo cáo hàng hỏng', 'Cần hỗ trợ thủ tục'];
}

export default function ChatBox() {
  const [isOpen, setIsOpen] = useState(false);
  const [recipientType, setRecipientType] = useState<RecipientType>('customer');
  const [customerId, setCustomerId] = useState(demoCustomers[0].id);

  const activeCustomer = useMemo(
    () => demoCustomers.find((c) => c.id === customerId) || demoCustomers[0],
    [customerId],
  );
  const activeKey = recipientType === 'customer' ? `customer:${activeCustomer.id}` : recipientType;

  const [threads, setThreads] = useState<Record<string, Message[]>>(() => {
    const c = demoCustomers[0];
    return {
      [`customer:${c.id}`]: [
        {
          id: 1,
          text: `Xin chào! Tôi là trợ lý ảo của **Hùng Thủy**. Bạn muốn nhắn với khách hàng nào?`,
          sender: 'bot',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
  });
  const messages = threads[activeKey] || [];
  const [customerQuery, setCustomerQuery] = useState('');
  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();
    if (!query) return demoCustomers;
    return demoCustomers.filter((customer) => customer.name.toLowerCase().includes(query));
  }, [customerQuery]);

  // Ensure each recipient has its own chat thread for demo.
  useEffect(() => {
    setThreads((prev) => {
      if (prev[activeKey]) return prev;
      const recipientLabel = recipientType === 'customer' ? 'khách hàng' : recipientType === 'dispatcher' ? 'điều phối' : 'nhân viên kho';
      const nextMsgs: Message[] = [
        {
          id: 1,
          text: `Xin chào! Tôi là trợ lý ảo Hùng Thủy. Bạn muốn nhắn với ${recipientLabel}?`,
          sender: 'bot',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ];
      return { ...prev, [activeKey]: nextMsgs };
    });
  }, [activeKey, recipientType, activeCustomer.name]);
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

    const keyAtSend = activeKey;
    const recipientAtSend = recipientType;
    const customerNameAtSend = activeCustomer.name;

    const userMsg: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setThreads((prev) => ({
      ...prev,
      [keyAtSend]: [...(prev[keyAtSend] || []), userMsg],
    }));
    setInputText('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));

    const botMsg: Message = {
      id: Date.now() + 1,
      text: getResponse(text, recipientAtSend, recipientAtSend === 'customer' ? customerNameAtSend : undefined),
      sender: 'bot',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setIsTyping(false);
    setThreads((prev) => ({
      ...prev,
      [keyAtSend]: [...(prev[keyAtSend] || []), botMsg],
    }));
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
            className="w-[460px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            style={{ height: '560px' }}
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

            {/* Recipient selector (demo) */}
            <div className="p-3 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-200">Nhắn tới</div>
                  <select
                    value={recipientType}
                    onChange={(e) => setRecipientType(e.target.value as RecipientType)}
                    className="text-xs px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="dispatcher">Điều phối</option>
                    <option value="warehouse">Nhân viên kho</option>
                  </select>
                </div>

                {recipientType === 'customer' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-gray-600 dark:text-gray-200">Tìm khách hàng</div>
                      <span className="text-xs text-gray-400">{filteredCustomers.length} kết quả</span>
                    </div>
                    <input
                      value={customerQuery}
                      onChange={(e) => setCustomerQuery(e.target.value)}
                      placeholder="Nhập tên khách hàng"
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm"
                    />
                    <div className="flex flex-wrap gap-2">
                      {filteredCustomers.map((customer) => (
                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => setCustomerId(customer.id)}
                          className={`text-xs px-3 py-1.5 rounded-full border ${customerId === customer.id ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700'}`}
                        >
                          {customer.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
              {quickRepliesFor(recipientType, activeCustomer.name).map((reply) => (
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

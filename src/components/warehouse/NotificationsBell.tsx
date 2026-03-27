import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCircle2, Clock, X } from 'lucide-react';
import { useWarehouseAuth } from '../../contexts/WarehouseAuthContext';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  archived: boolean;
  created_at: string;
};

const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'demo-1',
    title: 'Kho lạnh đã đạt 90% công suất',
    message: 'Cần xử lý ngay để tránh suy giảm chất lượng hàng đông lạnh.',
    type: 'warning',
    read: false,
    archived: false,
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'demo-2',
    title: 'Đơn hàng ORD-10 mới từ Hàng Hải Bình Minh',
    message: 'Đơn hàng mới đã được tạo và chờ xác nhận.',
    type: 'info',
    read: false,
    archived: false,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'demo-3',
    title: 'Lệnh nhập kho container CT-001 thành công',
    message: 'Container CT-001 đã vào kho và đang chờ kiểm tra.',
    type: 'info',
    read: true,
    archived: false,
    created_at: new Date(Date.now() - 60 * 60000).toISOString(),
  },
  {
    id: 'demo-4',
    title: 'Đơn hàng ORD-9 từ Cảng Sài Gòn đã được duyệt',
    message: 'Đơn hàng ORD-9 đã được chấp nhận và sắp xếp lịch tàu.',
    type: 'info',
    read: true,
    archived: false,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN');
}

function typeBadgeClass(type: Notification['type']) {
  switch (type) {
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
  }
}

export default function NotificationsBell() {
  const { accessToken, user } = useWarehouseAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlyUnread, setOnlyUnread] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<Notification | null>(null);

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || publicAnonKey}`,
    }),
    [accessToken],
  );

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/notifications?limit=50`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lấy thông báo');
      setNotifications(data.notifications || []);
    } catch (e: any) {
      // Non-admin roles might get 403; keep header silent for demo.
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sourceNotifications = notifications.length > 0 ? notifications : DEMO_NOTIFICATIONS;
  const unreadCount = useMemo(
    () => sourceNotifications.filter((n) => !n.read && !n.archived).length,
    [sourceNotifications],
  );

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    const base = sourceNotifications.filter((n) => !n.archived);
    const unreadFiltered = onlyUnread ? base.filter((n) => !n.read) : base;
    if (!k) return unreadFiltered;
    return unreadFiltered.filter((n) => `${n.title} ${n.message} ${n.type}`.toLowerCase().includes(k));
  }, [sourceNotifications, onlyUnread, keyword]);

  const markAllRead = () => {
    const base = notifications.length > 0 ? notifications : DEMO_NOTIFICATIONS;
    setNotifications(base.map((n) => ({ ...n, read: true })));
  };

  const markRead = async (n: Notification) => {
    if (n.read) return;
    if (notifications.length === 0) {
      setNotifications(DEMO_NOTIFICATIONS.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      return;
    }
    const res = await fetch(`${apiUrl}/notifications/${n.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ read: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
  };

  const onSelect = async (n: Notification) => {
    setSelected(n);
    try {
      await markRead(n);
    } catch {
      // ignore for demo
    }
  };

  useEffect(() => {
    if (!open) return;
    const onDocDown = (ev: MouseEvent) => {
      const t = ev.target as Node | null;
      if (!t) return;
      if (panelRef.current?.contains(t)) return;
      if (buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [open]);

  // Chỉ admin có trung tâm thông báo demo
  if (!user || user.role !== 'admin') {
    return (
      <button
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Thông báo"
      >
        <Bell size={20} />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        onClick={() => setOpen((o) => !o)}
        aria-label="Thông báo"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-[420px] max-w-[92vw] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-blue-600" />
                <div className="font-semibold text-sm">Thông báo</div>
                {unreadCount > 0 && <Badge className="ml-1 bg-blue-50 text-blue-700">{unreadCount}</Badge>}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={onlyUnread ? 'default' : 'outline'}
                  className={onlyUnread ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  onClick={() => setOnlyUnread((v) => !v)}
                >
                  {onlyUnread ? 'Chưa đọc' : 'Tất cả'}
                </Button>
                <Button size="sm" variant="outline" onClick={markAllRead}>
                  Đọc tất cả
                </Button>
              </div>
            </div>

            <div className="mt-3">
              <Input
                placeholder="Lọc theo title/message..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading && (
              <div className="p-4 text-sm text-gray-600 dark:text-gray-300">Đang tải...</div>
            )}

            {!loading && error && (
              <div className="p-4 text-sm text-red-600 dark:text-red-300">{error}</div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="p-4 text-sm text-gray-600 dark:text-gray-300">Không có thông báo phù hợp.</div>
            )}

            {!loading &&
              filtered.map((n) => (
                <button
                  key={n.id}
                  className={`w-full text-left px-3 py-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/40 flex items-start gap-3 ${
                    selected?.id === n.id ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                  }`}
                  onClick={() => onSelect(n)}
                >
                  <span className="mt-1">
                    {!n.read ? (
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                    ) : (
                      <span className="inline-block w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-sm truncate">{n.title}</div>
                      <Badge className={typeBadgeClass(n.type)}>{n.type}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{n.message}</div>
                    <div className="text-[11px] text-gray-500 mt-2 flex items-center gap-2">
                      <Clock size={14} />
                      {formatTime(n.created_at)}
                    </div>
                  </div>
                  {n.read ? <CheckCircle2 size={16} className="text-green-600 mt-1" /> : null}
                </button>
              ))}
          </div>

          {selected && (
            <div className="p-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-sm">{selected.title}</div>
                  <div className="text-sm mt-1 text-gray-700 dark:text-gray-200 whitespace-pre-line">{selected.message}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                  <X size={16} />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


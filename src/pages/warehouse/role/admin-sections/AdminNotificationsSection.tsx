import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Plus, RefreshCw, Trash2, Pencil, Bell, Search } from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../../../components/ui/dialog';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Checkbox } from '../../../../components/ui/checkbox';
import { useWarehouseAuth } from '../../../../contexts/WarehouseAuthContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  archived: boolean;
  created_at: string;
};

function typeBadge(type: Notification['type']) {
  switch (type) {
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
  }
}

export default function AdminNotificationsSection() {
  const { accessToken } = useWarehouseAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [keyword, setKeyword] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Notification | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [form, setForm] = useState<{ title: string; message: string; type: Notification['type'] }>({
    title: '',
    message: '',
    type: 'info',
  });

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/notifications?limit=200`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lấy thông báo');
      setNotifications(data.notifications || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return notifications;
    return notifications.filter((n) => `${n.title} ${n.message} ${n.type}`.toLowerCase().includes(k));
  }, [notifications, keyword]);

  const resetForm = () =>
    setForm({
      title: '',
      message: '',
      type: 'info',
    });

  const handleCreate = async () => {
    const payload = { title: form.title, message: form.message, type: form.type };
    const res = await fetch(`${apiUrl}/notifications`, { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi tạo thông báo');
    return data.notification;
  };

  const handleEdit = async () => {
    if (!editing) return;
    const payload = {
      title: form.title,
      message: form.message,
      type: form.type,
      // read/archived sẽ nằm trong `editing`, chỉnh ở dialog edit
    };
    const res = await fetch(`${apiUrl}/notifications/${editing.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật thông báo');
    return data.notification;
  };

  const handleDelete = async (id: string) => {
    const ok = confirm('Bạn có chắc chắn muốn xóa thông báo này không?');
    if (!ok) return;
    const res = await fetch(`${apiUrl}/notifications/${id}`, { method: 'DELETE', headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi xóa thông báo');
  };

  const handleQuickToggle = async (n: Notification, patch: Partial<Pick<Notification, 'read' | 'archived'>>) => {
    const res = await fetch(`${apiUrl}/notifications/${n.id}`, { method: 'PATCH', headers, body: JSON.stringify(patch) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');
  };

  const openEdit = (n: Notification) => {
    setEditing(n);
    setForm({ title: n.title, message: n.message, type: n.type });
    setEditOpen(true);
  };

  const submitEdit = async () => {
    try {
      await handleEdit();
      await fetchNotifications();
      setEditOpen(false);
      setEditing(null);
    } catch (e: any) {
      alert(e.message || 'Lỗi không xác định');
    }
  };

  const submitCreate = async () => {
    try {
      await handleCreate();
      await fetchNotifications();
      setCreateOpen(false);
      resetForm();
    } catch (e: any) {
      alert(e.message || 'Lỗi không xác định');
    }
  };

  const submitDelete = async (id: string) => {
    try {
      await handleDelete(id);
      await fetchNotifications();
    } catch (e: any) {
      alert(e.message || 'Lỗi không xác định');
    }
  };

  const [toggleBusyId, setToggleBusyId] = useState<string>('');

  const togglePatch = async (n: Notification, patch: Partial<Pick<Notification, 'read' | 'archived'>>) => {
    try {
      setToggleBusyId(n.id);
      await handleQuickToggle(n, patch);
      await fetchNotifications();
    } catch (e: any) {
      alert(e.message || 'Lỗi không xác định');
    } finally {
      setToggleBusyId('');
    }
  };

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý thông báo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Tạo, chỉnh sửa, bật/tắt trạng thái và xóa thông báo.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchNotifications} disabled={loading}>
              Thử lại
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Danh sách thông báo ({filtered.length})
            </CardTitle>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo title/message/type..."
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={fetchNotifications} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
              <Dialog open={createOpen} onOpenChange={(o) => (setCreateOpen(o), !o && resetForm())}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-900 hover:bg-blue-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo thông báo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>Tạo thông báo</DialogTitle>
                    <DialogDescription>Nhập nội dung để hiển thị trong trung tâm thông báo/ cảnh báo.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Tiêu đề</div>
                      <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="VD: Đã có cập nhật..." />
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Loại</div>
                      <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as Notification['type'] }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="info">info</SelectItem>
                          <SelectItem value="warning">warning</SelectItem>
                          <SelectItem value="error">error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-gray-700">Nội dung</div>
                      <Textarea
                        value={form.message}
                        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                        placeholder="Nhập message..."
                        className="min-h-[140px]"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setCreateOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={submitCreate} className="bg-blue-900 hover:bg-blue-800 text-white">
                      Tạo
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="py-10 text-gray-600 dark:text-gray-400">Đang tải...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-semibold">{n.title}</TableCell>
                      <TableCell>
                        <Badge className={typeBadge(n.type)}>{n.type}</Badge>
                      </TableCell>
                      <TableCell className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={n.read}
                            disabled={toggleBusyId === n.id}
                            onCheckedChange={(v) => togglePatch(n, { read: Boolean(v) })}
                          />
                          <span className="text-sm text-gray-700">Đã đọc</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={n.archived}
                            disabled={toggleBusyId === n.id}
                            onCheckedChange={(v) => togglePatch(n, { archived: Boolean(v) })}
                          />
                          <span className="text-sm text-gray-700">Lưu trữ</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate">{n.message}</TableCell>
                      <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(n)} className="text-blue-700 hover:text-blue-800 hover:bg-blue-50">
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => submitDelete(n.id)} className="text-red-700 hover:text-red-800 hover:bg-red-50">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                        Không có thông báo phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit dialog */}
        <Dialog open={editOpen} onOpenChange={(o) => (setEditOpen(o), !o && setEditing(null))}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Sửa thông báo</DialogTitle>
              <DialogDescription>Cập nhật nội dung và trạng thái hiển thị.</DialogDescription>
            </DialogHeader>

            {editing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Tiêu đề</div>
                  <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Loại</div>
                  <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as Notification['type'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">info</SelectItem>
                      <SelectItem value="warning">warning</SelectItem>
                      <SelectItem value="error">error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Nội dung</div>
                  <Textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} className="min-h-[140px]" />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={editing.read}
                      onCheckedChange={(v) => setEditing((prev) => (prev ? { ...prev, read: Boolean(v) } : prev))}
                    />
                    <span className="text-sm text-gray-700">Đã đọc</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={editing.archived}
                      onCheckedChange={(v) => setEditing((prev) => (prev ? { ...prev, archived: Boolean(v) } : prev))}
                    />
                    <span className="text-sm text-gray-700">Lưu trữ</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 dark:text-gray-400">Không có dữ liệu</div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Hủy
              </Button>
              <Button
                className="bg-blue-900 hover:bg-blue-800 text-white"
                onClick={async () => {
                  if (!editing) return;
                  try {
                    const payload = {
                      title: form.title,
                      message: form.message,
                      type: form.type,
                      read: editing.read,
                      archived: editing.archived,
                    };
                    const res = await fetch(`${apiUrl}/notifications/${editing.id}`, {
                      method: 'PATCH',
                      headers,
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật');
                    await fetchNotifications();
                    setEditOpen(false);
                    setEditing(null);
                  } catch (e: any) {
                    alert(e.message || 'Lỗi không xác định');
                  }
                }}
              >
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WarehouseLayout>
  );
}


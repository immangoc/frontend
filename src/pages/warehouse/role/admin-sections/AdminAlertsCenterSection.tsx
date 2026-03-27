import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Bell, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { useWarehouseAuth } from '../../../../contexts/WarehouseAuthContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

type ContainerItem = {
  id: string;
  status: 'pending' | 'in_storage' | 'exported';
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  archived: boolean;
  created_at: string;
};

function badgeClass(type: Notification['type']) {
  switch (type) {
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'error':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
  }
}

export default function AdminAlertsCenterSection() {
  const { accessToken } = useWarehouseAuth();
  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [onlyWarnings, setOnlyWarnings] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, nRes] = await Promise.all([
        fetch(`${apiUrl}/containers`, { headers }),
        fetch(`${apiUrl}/notifications?limit=200`, { headers }),
      ]);
      const cData = await cRes.json();
      const nData = await nRes.json();
      if (!cRes.ok) throw new Error(cData.error || 'Lỗi lấy containers');
      if (!nRes.ok) throw new Error(nData.error || 'Lỗi lấy notifications');
      setContainers(cData.containers || []);
      setNotifications(nData.notifications || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const pending = containers.filter((c) => c.status === 'pending').length;
    const in_storage = containers.filter((c) => c.status === 'in_storage').length;
    const exported = containers.filter((c) => c.status === 'exported').length;
    return { pending, in_storage, exported };
  }, [containers]);

  const alertNotifications = useMemo(() => {
    const base = notifications.filter((n) => !n.archived);
    if (!onlyWarnings) return base;
    return base.filter((n) => n.type === 'warning' || n.type === 'error');
  }, [notifications, onlyWarnings]);

  const handleResolve = async (n: Notification) => {
    const res = await fetch(`${apiUrl}/notifications/${n.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ archived: true, read: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi xử lý thông báo');
    await fetchAll();
  };

  const toggleArchived = async (n: Notification) => {
    const res = await fetch(`${apiUrl}/notifications/${n.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ archived: !n.archived, read: true }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật thông báo');
    await fetchAll();
  };

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cảnh báo & Trung tâm thông báo</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kết hợp cảnh báo hệ thống và thông báo quản trị.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchAll} disabled={loading}>
              Thử lại
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">{stats.pending}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Container đang ở trạng thái `pending`.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Trong kho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">{stats.in_storage}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Container đang ở trạng thái `in_storage`.</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Đã xuất
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 dark:text-white">{stats.exported}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Container đã được đánh dấu `exported`.</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              Trung tâm thông báo ({alertNotifications.length})
            </CardTitle>

            <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant={onlyWarnings ? 'default' : 'outline'}
                  className={onlyWarnings ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
                  onClick={() => setOnlyWarnings(true)}
                >
                  Chỉ cảnh báo
                </Button>
                <Button
                  variant={!onlyWarnings ? 'default' : 'outline'}
                  className={!onlyWarnings ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                  onClick={() => setOnlyWarnings(false)}
                >
                  Tất cả
                </Button>
              </div>
              <Button variant="outline" onClick={fetchAll} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
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
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertNotifications.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="font-semibold">{n.title}</TableCell>
                      <TableCell>
                        <Badge className={badgeClass(n.type)}>{n.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[360px] truncate">{n.message}</TableCell>
                      <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => handleResolve(n)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Đã xử lý
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700 hover:bg-red-50"
                            onClick={() => toggleArchived(n)}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Lưu / bỏ
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {alertNotifications.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                        Không có thông báo phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </WarehouseLayout>
  );
}


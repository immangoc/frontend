import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw, Search } from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { useWarehouseAuth } from '../../../../contexts/WarehouseAuthContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

type Activity = {
  id: string;
  user_id: string;
  user_name: string;
  action_type: string;
  entity_type: string;
  entity_id: string;
  description: string;
  created_at: string;
};

export default function AdminActivitiesSection() {
  const { accessToken } = useWarehouseAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [keyword, setKeyword] = useState('');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };

  const fetchActivities = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/activities?limit=200`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lấy nhật ký hoạt động');
      setActivities(data.activities || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return activities;
    return activities.filter((a) => {
      const haystack = `${a.user_name} ${a.description} ${a.action_type} ${a.entity_type} ${a.entity_id}`.toLowerCase();
      return haystack.includes(k);
    });
  }, [activities, keyword]);

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhật ký hoạt động</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Theo dõi các thao tác tạo/cập nhật/xóa trong hệ thống.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchActivities} disabled={loading}>
              Thử lại
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600" />
              Danh sách ({filtered.length})
            </CardTitle>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo mô tả, người dùng, loại..."
                className="sm:flex-1"
              />
              <Button variant="outline" onClick={fetchActivities} disabled={loading}>
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
                    <TableHead>Thao tác</TableHead>
                    <TableHead>Đối tượng</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Thời gian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="whitespace-nowrap">
                        <Badge variant="outline">{a.action_type}</Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {a.entity_type}: {a.entity_id}
                      </TableCell>
                      <TableCell className="text-sm">{a.description}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-gray-500">
                        {new Date(a.created_at).toLocaleString('vi-VN')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                        Không có dữ liệu phù hợp.
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


import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, RefreshCw, Table2, Truck } from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useWarehouseAuth } from '../../../../contexts/WarehouseAuthContext';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type ContainerItem = {
  id: string;
  container_number: string;
  customer_name: string;
  cargo_type: string;
  weight_kg: number;
  status: 'pending' | 'in_storage' | 'exported';
  created_at: string;
  export_date?: string;
};

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseISODate(s: string) {
  // Use local date at midnight
  const [y, m, d] = s.split('-').map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export default function AdminImportExportSection() {
  const { accessToken } = useWarehouseAuth();
  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [containers, setContainers] = useState<ContainerItem[]>([]);

  const today = new Date();
  const [startDate, setStartDate] = useState(() => toISODate(new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30)));
  const [endDate, setEndDate] = useState(() => toISODate(today));

  const fetchContainers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/containers`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lấy container');
      setContainers(data.containers || []);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const range = useMemo(() => {
    const start = parseISODate(startDate);
    const end = parseISODate(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [startDate, endDate]);

  const importByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of containers) {
      const d = new Date(c.created_at);
      if (d < range.start || d > range.end) continue;
      const key = toISODate(new Date(d));
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [containers, range.start, range.end]);

  const exportByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of containers) {
      if (c.status !== 'exported' || !c.export_date) continue;
      const d = new Date(c.export_date);
      if (d < range.start || d > range.end) continue;
      const key = toISODate(new Date(d));
      map.set(key, (map.get(key) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [containers, range.start, range.end]);

  const importsList = useMemo(() => {
    return containers
      .filter((c) => {
        const d = new Date(c.created_at);
        return d >= range.start && d <= range.end;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 50);
  }, [containers, range.start, range.end]);

  const exportsList = useMemo(() => {
    return containers
      .filter((c) => c.status === 'exported' && c.export_date)
      .filter((c) => {
        const d = new Date(c.export_date as string);
        return d >= range.start && d <= range.end;
      })
      .sort((a, b) => new Date(b.export_date as string).getTime() - new Date(a.export_date as string).getTime())
      .slice(0, 50);
  }, [containers, range.start, range.end]);

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nhập xuất theo ngày</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Thống kê số lượt nhập (created_at) và xuất (export_date) theo khoảng thời gian.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchContainers} disabled={loading}>
              Thử lại
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Bộ lọc ngày
            </CardTitle>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Từ ngày</div>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Đến ngày</div>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="pb-1">
                <Button variant="outline" onClick={fetchContainers} disabled={loading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới dữ liệu
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {loading ? (
          <div className="py-10 text-gray-600 dark:text-gray-400">Đang tải...</div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Table2 className="w-5 h-5 text-blue-600" />
                    Nhập kho theo ngày
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={importByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Tổng lượt nhập trong khoảng: <span className="font-semibold">{importByDay.reduce((s, x) => s + x.count, 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Xuất hàng theo ngày
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={exportByDay}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Tổng lượt xuất trong khoảng: <span className="font-semibold">{exportByDay.reduce((s, x) => s + x.count, 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Danh sách nhập gần nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Khách</TableHead>
                        <TableHead>Loại hàng</TableHead>
                        <TableHead className="text-right">Trọng lượng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importsList.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono font-semibold">{c.container_number}</TableCell>
                          <TableCell className="text-sm">{c.customer_name || '—'}</TableCell>
                          <TableCell className="text-sm">{c.cargo_type}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{Number(c.weight_kg).toLocaleString()} kg</TableCell>
                        </TableRow>
                      ))}
                      {importsList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                            Không có dữ liệu nhập trong khoảng.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Danh sách xuất gần nhất</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mã</TableHead>
                        <TableHead>Khách</TableHead>
                        <TableHead>Loại hàng</TableHead>
                        <TableHead className="text-right">Trọng lượng</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exportsList.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-mono font-semibold">{c.container_number}</TableCell>
                          <TableCell className="text-sm">{c.customer_name || '—'}</TableCell>
                          <TableCell className="text-sm">{c.cargo_type}</TableCell>
                          <TableCell className="text-right text-sm font-semibold">{Number(c.weight_kg).toLocaleString()} kg</TableCell>
                        </TableRow>
                      ))}
                      {exportsList.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                            Không có dữ liệu xuất trong khoảng.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </WarehouseLayout>
  );
}


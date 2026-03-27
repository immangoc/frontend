import { useEffect, useMemo, useState } from 'react';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';
import {
  Container, Users, TrendingUp, Package, BarChart3, Calendar,
  Activity, RefreshCw, AlertCircle, Download, FileText, PieChart, Pie,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const { user, token } = useWarehouseAuth();
  const [stats, setStats] = useState<any>(null);
  const [userCount, setUserCount] = useState<number>(0);
  const [containers, setContainers] = useState<any[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || publicAnonKey}` };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, containersRes, feesRes] = await Promise.all([
        fetch(`${apiUrl}/dashboard/stats`, { headers }),
        fetch(`${apiUrl}/users`, { headers }),
        fetch(`${apiUrl}/containers`, { headers }),
        fetch(`${apiUrl}/fees`, { headers }),
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const containersData = await containersRes.json();
      const feesData = await feesRes.json();

      if (!statsRes.ok) throw new Error(statsData.error || 'Lỗi lấy thống kê');

      setStats(statsData.stats);
      setUserCount(usersData.users?.length || 0);
      if (!containersRes.ok) throw new Error(containersData.error || 'Lỗi lấy container');
      if (!feesRes.ok) throw new Error(feesData.error || 'Lỗi lấy cước phí');
      setContainers(containersData.containers || []);
      setFees(feesData.fees || null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const last12Months = useMemo(() => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - 11);
    start.setDate(1);
    const labels = Array.from({ length: 12 }, (_, i) => `T${i + 1}`);
    const startYear = start.getFullYear();
    const startMonth = start.getMonth();
    const monthIndex = (d: Date) =>
      (d.getFullYear() - startYear) * 12 + (d.getMonth() - startMonth);
    return { start, end, labels, monthIndex };
  }, []);

  const rateFor = (cargoType: string) => {
    const by = fees?.ratePerKgByCargoType || {};
    const v = by?.[cargoType];
    if (typeof v === 'number') return v;
    return typeof fees?.ratePerKgDefault === 'number' ? fees.ratePerKgDefault : 0;
  };

  const costRate = typeof fees?.costRate === 'number' ? fees.costRate : 0.35;

  const revenueByMonth = useMemo(() => {
    const arr = Array.from({ length: 12 }, () => 0);
    for (const c of containers) {
      if (c.status !== 'exported' || !c.export_date) continue;
      const d = new Date(c.export_date);
      const idx = last12Months.monthIndex(d);
      if (idx < 0 || idx > 11) continue;
      const revenue = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      arr[idx] += revenue;
    }
    return arr;
  }, [containers, last12Months]);

  const ordersByMonth = useMemo(() => {
    const arr = Array.from({ length: 12 }, () => 0);
    for (const c of containers) {
      if (c.status !== 'exported' || !c.export_date) continue;
      const d = new Date(c.export_date);
      const idx = last12Months.monthIndex(d);
      if (idx < 0 || idx > 11) continue;
      arr[idx] += 1;
    }
    return arr;
  }, [containers, last12Months]);

  const revenueChartData = useMemo(
    () => revenueByMonth.map((v, i) => ({ name: last12Months.labels[i], value: Math.round(v) })),
    [revenueByMonth, last12Months.labels],
  );

  const ordersChartData = useMemo(
    () => ordersByMonth.map((v, i) => ({ name: last12Months.labels[i], value: v })),
    [ordersByMonth, last12Months.labels],
  );

  const topProducts = useMemo(() => {
    const map = new Map<string, { cargo_type: string; count: number; revenue: number }>();
    for (const c of containers) {
      if (c.status !== 'exported') continue;
      const cargo = c.cargo_type || 'Khác';
      const prev = map.get(cargo) || { cargo_type: cargo, count: 0, revenue: 0 };
      prev.count += 1;
      prev.revenue += Number(c.weight_kg || 0) * rateFor(cargo);
      map.set(cargo, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 6);
  }, [containers, fees]);

  const recentExports = useMemo(() => {
    const list = containers
      .filter((c) => c.status === 'exported' && c.export_date)
      .sort((a, b) => new Date(b.export_date).getTime() - new Date(a.export_date).getTime())
      .slice(0, 6)
      .map((c) => ({
        id: c.id,
        container_number: c.container_number,
        customer_name: c.customer_name || '—',
        export_date: c.export_date,
        revenue: Math.round(Number(c.weight_kg || 0) * rateFor(c.cargo_type)),
        cargo_type: c.cargo_type,
      }));
    return list;
  }, [containers, fees]);

  const statCards = stats ? [
    { title: 'Tổng Container', value: stats.total, icon: Container, color: 'bg-blue-500', sub: 'container trong hệ thống' },
    { title: 'Đang lưu kho', value: stats.in_storage, icon: Package, color: 'bg-indigo-500', sub: 'container đang lưu' },
    { title: 'Chờ xử lý', value: stats.pending, icon: TrendingUp, color: 'bg-yellow-500', sub: 'container chờ xử lý' },
    { title: 'Người dùng', value: userCount, icon: Users, color: 'bg-green-500', sub: 'tài khoản trong hệ thống' },
  ] : [];

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Chào mừng, <span className="font-semibold">{user?.name}</span> · Dữ liệu thời gian thực từ Supabase
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Link to="/warehouse/admin/section/bao-cao-thong-ke">
              <Button className="gap-2 bg-blue-700 hover:bg-blue-800">
                <FileText className="w-4 h-4" /> Báo cáo
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" /> 
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchData} className="ml-auto">Thử lại</Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat) => (
                <Card key={stat.title}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
                        <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
                      </div>
                      <div className={`${stat.color} p-3 rounded-xl`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Doanh thu 12 tháng gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Tổng doanh thu ước tính: <span className="font-semibold">{revenueChartData.reduce((s, x) => s + x.value, 0).toLocaleString('vi-VN')}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600" />
                    Số lượng đơn hàng 12 tháng gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ordersChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Tổng số đơn: <span className="font-semibold">{ordersChartData.reduce((s, x) => s + x.value, 0)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tables row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex items-start justify-between gap-3">
                  <CardTitle>Sản phẩm bán chạy</CardTitle>
                  <Link to="/warehouse/admin/section/bao-cao-thong-ke">
                    <Button variant="outline" size="sm">Xem tất cả</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sản phẩm</TableHead>
                          <TableHead className="text-right">Số lần xuất</TableHead>
                          <TableHead className="text-right">Doanh thu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topProducts.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-gray-500 py-10">
                              Chưa có dữ liệu
                            </TableCell>
                          </TableRow>
                        ) : (
                          topProducts.map((p) => (
                            <TableRow key={p.cargo_type}>
                              <TableCell className="font-semibold">{p.cargo_type}</TableCell>
                              <TableCell className="text-right">{p.count}</TableCell>
                              <TableCell className="text-right">{Math.round(p.revenue).toLocaleString('vi-VN')}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-start justify-between gap-3">
                  <CardTitle>Đơn hàng gần nhất</CardTitle>
                  <Link to="/warehouse/admin/section/bao-cao-thong-ke">
                    <Button variant="outline" size="sm">Xem tất cả</Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã đơn</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Ngày xuất</TableHead>
                          <TableHead className="text-right">Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentExports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                              Chưa có dữ liệu
                            </TableCell>
                          </TableRow>
                        ) : (
                          recentExports.map((o) => (
                            <TableRow key={o.id}>
                              <TableCell className="font-mono font-semibold">{o.container_number}</TableCell>
                              <TableCell className="text-sm">{o.customer_name}</TableCell>
                              <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                                {new Date(o.export_date).toLocaleDateString('vi-VN')}
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                                  Đã xuất
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </WarehouseLayout>
  );
}
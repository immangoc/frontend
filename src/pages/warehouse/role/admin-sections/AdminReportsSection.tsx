import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Download,
  RefreshCw,
  TrendingUp,
  PieChart as PieChartIcon,
  Users,
  Package,
  Settings,
  FileText,
} from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { useWarehouseAuth } from '../../../../contexts/WarehouseAuthContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ContainerItem = {
  id: string;
  container_number: string;
  cargo_type: string;
  weight_kg: number;
  status: 'pending' | 'in_storage' | 'exported';
  created_at: string;
  export_date?: string;
  zone?: string;
  block?: string;
  customer_id?: string;
  customer_name?: string;
};

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'planner' | 'operator' | 'customer';
  company?: string;
  phone?: string;
  status?: string;
};

type FeesConfig = {
  currency?: string;
  costRate?: number;
  ratePerKgDefault?: number;
  ratePerKgByCargoType?: Record<string, number>;
};

type Mode = 'revenue_profit' | 'performance' | 'inventory' | 'customer_stats' | 'export_report';

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseISODate(s: string) {
  const [y, m, d] = s.split('-').map((v) => parseInt(v, 10));
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

export default function AdminReportsSection({
  mode,
  showLayout = true,
}: {
  mode: Mode;
  showLayout?: boolean;
}) {
  const { accessToken } = useWarehouseAuth();

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };

  const today = new Date();
  const [startDate, setStartDate] = useState(() => toISODate(new Date(today.getTime() - 1000 * 60 * 60 * 24 * 30)));
  const [endDate, setEndDate] = useState(() => toISODate(today));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [fees, setFees] = useState<FeesConfig | null>(null);

  const [exportType, setExportType] = useState<'revenue_profit' | 'inventory' | 'customer_stats' | 'performance'>('revenue_profit');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, uRes, fRes] = await Promise.all([
        fetch(`${apiUrl}/containers`, { headers }),
        fetch(`${apiUrl}/users`, { headers }),
        fetch(`${apiUrl}/fees`, { headers }),
      ]);
      const cData = await cRes.json();
      const uData = await uRes.json();
      const fData = await fRes.json();
      if (!cRes.ok) throw new Error(cData.error || 'Lỗi lấy containers');
      if (!uRes.ok) throw new Error(uData.error || 'Lỗi lấy users');
      if (!fRes.ok) throw new Error(fData.error || 'Lỗi lấy fees');
      setContainers(cData.containers || []);
      setUsers(uData.users || []);
      setFees(fData.fees || null);
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

  const range = useMemo(() => {
    const start = parseISODate(startDate);
    const end = parseISODate(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, [startDate, endDate]);

  const exportedInRange = useMemo(() => {
    return containers.filter((c) => {
      if (c.status !== 'exported' || !c.export_date) return false;
      const d = new Date(c.export_date);
      return d >= range.start && d <= range.end;
    });
  }, [containers, range.start, range.end]);

  const importedInRange = useMemo(() => {
    return containers.filter((c) => {
      const d = new Date(c.created_at);
      return d >= range.start && d <= range.end;
    });
  }, [containers, range.start, range.end]);

  const inStorageInRange = useMemo(() => {
    return containers.filter((c) => {
      if (c.status !== 'in_storage') return false;
      const d = new Date(c.created_at);
      return d >= range.start && d <= range.end;
    });
  }, [containers, range.start, range.end]);

  const rateFor = (cargoType: string) => {
    const cost = fees || {};
    const by = cost.ratePerKgByCargoType || {};
    if (typeof by[cargoType] === 'number') return by[cargoType];
    return typeof cost.ratePerKgDefault === 'number' ? cost.ratePerKgDefault : 0;
  };

  const costRate = typeof fees?.costRate === 'number' ? fees!.costRate : 0.35;

  // Revenue/profit estimation (pseudo, based on fees config + exported containers)
  const revenueProfit = useMemo(() => {
    const revenue = exportedInRange.reduce((sum, c) => sum + Number(c.weight_kg || 0) * rateFor(c.cargo_type), 0);
    const cost = revenue * costRate;
    const profit = revenue - cost;
    return { revenue, cost, profit };
  }, [exportedInRange, fees, costRate]);

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of exportedInRange) {
      if (!c.export_date) continue;
      const d = new Date(c.export_date);
      const key = toISODate(d);
      const amount = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      map.set(key, (map.get(key) || 0) + amount);
    }
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [exportedInRange, fees]);

  const revenueByCustomer = useMemo(() => {
    const map = new Map<string, { customer_id: string; customer_name: string; revenue: number; count: number }>();
    for (const c of exportedInRange) {
      const key = c.customer_id || c.customer_name || c.customer_number || 'unknown';
      const name = c.customer_name || key;
      const prev = map.get(key) || { customer_id: key, customer_name: name, revenue: 0, count: 0 };
      prev.revenue += Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [exportedInRange, fees]);

  const inventoryByZone = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of containers) {
      if (c.status !== 'in_storage') continue;
      const d = new Date(c.created_at);
      if (d < range.start || d > range.end) continue;
      const zone = c.zone || 'A';
      map.set(zone, (map.get(zone) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([zone, count]) => ({ zone, count }))
      .sort((a, b) => b.count - a.count);
  }, [containers, range.start, range.end]);

  const exportRateByZone = useMemo(() => {
    const map = new Map<string, { total: number; exported: number; avgTurnaroundDays: number; sumTurnaroundDays: number }>();
    for (const c of importedInRange) {
      const zone = c.zone || 'A';
      const prev = map.get(zone) || { total: 0, exported: 0, avgTurnaroundDays: 0, sumTurnaroundDays: 0 };
      prev.total += 1;
      if (c.status === 'exported' && c.export_date) {
        prev.exported += 1;
        const start = new Date(c.created_at).getTime();
        const end = new Date(c.export_date).getTime();
        const days = (end - start) / (1000 * 60 * 60 * 24);
        prev.sumTurnaroundDays += days;
      }
      map.set(zone, prev);
    }
    const rows = Array.from(map.entries()).map(([zone, v]) => ({
      zone,
      exportRate: v.total === 0 ? 0 : (v.exported / v.total) * 100,
      avgTurnaroundDays: v.exported === 0 ? 0 : v.sumTurnaroundDays / v.exported,
    }));
    return rows.sort((a, b) => b.exportRate - a.exportRate);
  }, [importedInRange]);

  const exportDataForType = () => {
    const formatMoney = (n: number) => Math.round(n).toString();
    if (exportType === 'revenue_profit') {
      return {
        type: 'revenue_profit',
        range: { startDate, endDate },
        fees,
        summary: {
          revenue: formatMoney(revenueProfit.revenue),
          cost: formatMoney(revenueProfit.cost),
          profit: formatMoney(revenueProfit.profit),
        },
        revenueByDay,
        topCustomers: revenueByCustomer.slice(0, 10).map((x) => ({
          customer: x.customer_name,
          exportedCount: x.count,
          revenue: formatMoney(x.revenue),
        })),
      };
    }

    if (exportType === 'inventory') {
      return {
        type: 'inventory',
        range: { startDate, endDate },
        inventoryByZone,
      };
    }

    if (exportType === 'customer_stats') {
      return {
        type: 'customer_stats',
        range: { startDate, endDate },
        topCustomers: revenueByCustomer.map((x) => ({
          customer: x.customer_name,
          exportedCount: x.count,
          revenue: formatMoney(x.revenue),
        })),
      };
    }

    // performance
    return {
      type: 'performance',
      range: { startDate, endDate },
      exportRateByZone,
    };
  };

  const downloadJSON = () => {
    const payload = exportDataForType();
    downloadBlob(`report_${exportType}_${startDate}_${endDate}.json`, JSON.stringify(payload, null, 2), 'application/json');
  };

  const downloadCSV = () => {
    const payload = exportDataForType();
    let csv = '';
    if (exportType === 'revenue_profit') {
      csv = ['date,revenue'].concat((payload.revenueByDay || []).map((r: any) => `${r.date},${Math.round(r.value)}`)).join('\n');
    } else if (exportType === 'inventory') {
      csv = ['zone,count'].concat((payload.inventoryByZone || []).map((r: any) => `${r.zone},${r.count}`)).join('\n');
    } else if (exportType === 'customer_stats') {
      csv = ['customer,exportedCount,revenue'].concat((payload.topCustomers || []).map((r: any) => `${r.customer},${r.exportedCount},${r.revenue}`)).join('\n');
    } else if (exportType === 'performance') {
      csv = ['zone,exportRate,avgTurnaroundDays']
        .concat((payload.exportRateByZone || []).map((r: any) => `${r.zone},${r.exportRate.toFixed(2)},${r.avgTurnaroundDays.toFixed(2)}`))
        .join('\n');
    }
    downloadBlob(`report_${exportType}_${startDate}_${endDate}.csv`, csv, 'text/csv;charset=utf-8');
  };

  const summaryCards = useMemo(() => {
    if (mode === 'revenue_profit') {
      return [
        { title: 'Doanh thu ước tính', value: Math.round(revenueProfit.revenue).toLocaleString('vi-VN'), icon: TrendingUp, color: 'bg-blue-500' },
        { title: 'Chi phí ước tính', value: Math.round(revenueProfit.cost).toLocaleString('vi-VN'), icon: Settings, color: 'bg-yellow-500' },
        { title: 'Lợi nhuận ước tính', value: Math.round(revenueProfit.profit).toLocaleString('vi-VN'), icon: PieChartIcon, color: 'bg-green-500' },
      ];
    }
    if (mode === 'inventory') {
      const total = inventoryByZone.reduce((s, x) => s + x.count, 0);
      return [
        { title: 'Tổng tồn kho (in_storage)', value: total.toString(), icon: Package, color: 'bg-blue-500' },
        { title: 'Khu vực cao nhất', value: inventoryByZone[0]?.zone || '—', icon: Package, color: 'bg-yellow-500' },
      ];
    }
    if (mode === 'customer_stats') {
      return [
        { title: 'Số khách hàng có xuất', value: revenueByCustomer.length.toString(), icon: Users, color: 'bg-blue-500' },
        { title: 'Khách top doanh thu', value: revenueByCustomer[0]?.customer_name || '—', icon: Users, color: 'bg-yellow-500' },
      ];
    }
    if (mode === 'performance') {
      const top = exportRateByZone[0];
      return [
        { title: 'Zone xuất hiệu quả nhất', value: top ? `${top.zone} (${top.exportRate.toFixed(1)}%)` : '—', icon: TrendingUp, color: 'bg-blue-500' },
        { title: 'Turnaround trung bình', value: top ? `${top.avgTurnaroundDays.toFixed(1)} ngày` : '—', icon: TrendingUp, color: 'bg-yellow-500' },
      ];
    }
    return [];
  }, [mode, revenueProfit, inventoryByZone, revenueByCustomer, exportRateByZone]);

  const headerTitle = (() => {
    switch (mode) {
      case 'revenue_profit':
        return 'Báo cáo & Thống kê doanh thu, lợi nhuận';
      case 'performance':
        return 'Biểu đồ thống kê hiệu suất tối ưu';
      case 'inventory':
        return 'Báo cáo thống kê tồn kho';
      case 'customer_stats':
        return 'Báo cáo thống kê khách hàng';
      case 'export_report':
        return 'Xuất báo cáo';
      default:
        return 'Báo cáo';
    }
  })();

  const exportOptions = [
    { id: 'revenue_profit', label: 'Doanh thu & lợi nhuận' },
    { id: 'inventory', label: 'Tồn kho theo zone' },
    { id: 'customer_stats', label: 'Khách hàng (top theo doanh thu)' },
    { id: 'performance', label: 'Hiệu suất xuất theo zone' },
  ] as const;

  const page = (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{headerTitle}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Dữ liệu được tính từ `containers` + cấu hình cước phí.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Bộ lọc ngày
            </CardTitle>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Từ</div>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Đến</div>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>

              {mode === 'export_report' && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Loại báo cáo</div>
                  <Select value={exportType} onValueChange={(v) => setExportType(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {exportOptions.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pb-1 flex justify-start md:justify-end">
                <Button variant="outline" onClick={fetchAll} disabled={loading} className="w-full md:w-auto">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Làm mới dữ liệu
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-10 text-gray-600 dark:text-gray-400">Đang tải...</div>
        ) : (
          <>
            {summaryCards.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {summaryCards.map((c) => (
                  <Card key={c.title}>
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">{c.title}</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{c.value}</div>
                        </div>
                        <div className={`${c.color} p-3 rounded-xl`}>
                          <c.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* EXPORT MODE */}
            {mode === 'export_report' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-600" />
                      Tải file báo cáo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Xuất dạng `JSON` để lưu cấu trúc đầy đủ, hoặc dạng `CSV` cho excel.
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button className="bg-blue-900 hover:bg-blue-800 text-white" onClick={downloadJSON}>
                        Xuất JSON
                      </Button>
                      <Button variant="outline" onClick={downloadCSV}>
                        Xuất CSV
                      </Button>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Báo cáo đang chọn: <Badge className="ml-2">{exportType}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Xem tóm tắt nhanh</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {exportType === 'revenue_profit' ? (
                      <>
                        <div className="text-sm text-gray-600">Revenue</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(revenueProfit.revenue).toLocaleString('vi-VN')}</div>
                        <div className="text-sm text-gray-600">Profit</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(revenueProfit.profit).toLocaleString('vi-VN')}</div>
                      </>
                    ) : exportType === 'inventory' ? (
                      <>
                        <div className="text-sm text-gray-600">Top zone</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{inventoryByZone[0]?.zone || '—'}</div>
                      </>
                    ) : exportType === 'customer_stats' ? (
                      <>
                        <div className="text-sm text-gray-600">Top customer</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{revenueByCustomer[0]?.customer_name || '—'}</div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-gray-600">Best export zone</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{exportRateByZone[0]?.zone || '—'}</div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* REVENUE PROFIT */}
            {mode === 'revenue_profit' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Biểu đồ doanh thu theo ngày</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={revenueByDay}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cơ cấu doanh thu (top khách hàng)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueByCustomer.slice(0, 6).map((x) => ({ name: x.customer_name, value: Math.round(x.revenue) }))}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label
                          />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Top 10</div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead className="text-right">Xuất</TableHead>
                            <TableHead className="text-right">Doanh thu</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenueByCustomer.slice(0, 10).map((x) => (
                            <TableRow key={x.customer_id}>
                              <TableCell className="font-semibold">{x.customer_name}</TableCell>
                              <TableCell className="text-right">{x.count}</TableCell>
                              <TableCell className="text-right">{Math.round(x.revenue).toLocaleString('vi-VN')}</TableCell>
                            </TableRow>
                          ))}
                          {revenueByCustomer.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center text-gray-500 py-10">
                                Chưa có dữ liệu trong khoảng.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* PERFORMANCE */}
            {mode === 'performance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Export rate theo zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={exportRateByZone}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="exportRate" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Turnaround trung bình theo zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={exportRateByZone}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="avgTurnaroundDays" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* INVENTORY */}
            {mode === 'inventory' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tồn kho theo zone (in_storage)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryByZone}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="zone" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zone</TableHead>
                          <TableHead className="text-right">Số container</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inventoryByZone.map((r) => (
                          <TableRow key={r.zone}>
                            <TableCell className="font-semibold">{r.zone}</TableCell>
                            <TableCell className="text-right">{r.count}</TableCell>
                          </TableRow>
                        ))}
                        {inventoryByZone.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-gray-500 py-10">
                              Chưa có dữ liệu tồn kho trong khoảng.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* CUSTOMER STATS */}
            {mode === 'customer_stats' && (
              <Card>
                <CardHeader>
                  <CardTitle>Khách hàng (top theo doanh thu ước tính)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead className="text-right">Số lần xuất</TableHead>
                        <TableHead className="text-right">Doanh thu ước tính</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueByCustomer.slice(0, 30).map((x) => (
                        <TableRow key={x.customer_id}>
                          <TableCell className="font-semibold">{x.customer_name}</TableCell>
                          <TableCell className="text-right">{x.count}</TableCell>
                          <TableCell className="text-right">{Math.round(x.revenue).toLocaleString('vi-VN')}</TableCell>
                        </TableRow>
                      ))}
                      {revenueByCustomer.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-gray-500 py-10">
                            Chưa có dữ liệu trong khoảng.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
  );

  return showLayout ? <WarehouseLayout>{page}</WarehouseLayout> : page;
}


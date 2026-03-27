import React, { useEffect, useMemo, useState } from 'react';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';
import {
  Package,
  BarChart3,
  Activity,
  RefreshCw,
  AlertCircle,
  FileText,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import AdminWarehouseManagementLayout from '../../../components/warehouse/AdminWarehouseManagementLayout';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Link } from 'react-router';

export default function AdminDashboard() {
  const { user, token } = useWarehouseAuth();
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
      const [containersRes, feesRes] = await Promise.all([
        fetch(`${apiUrl}/containers`, { headers }),
        fetch(`${apiUrl}/fees`, { headers }),
      ]);
      const containersData = await containersRes.json();
      const feesData = await feesRes.json();
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
    // Bảng mới: loại container được lưu nhiều nhất + doanh thu của loại đó (từ container đã xuất)
    const map = new Map<string, { container_type: string; inStorageCount: number; revenue: number }>();
    for (const c of containers) {
      const type = c.container_type || 'Khác';
      const prev = map.get(type) || { container_type: type, inStorageCount: 0, revenue: 0 };
      if (c.status === 'in_storage') prev.inStorageCount += 1;
      if (c.status === 'exported' && c.export_date) {
        prev.revenue += Number(c.weight_kg || 0) * rateFor(c.cargo_type || 'Khác');
      }
      map.set(type, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.inStorageCount - a.inStorageCount).slice(0, 6);
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

  const statCards = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const totalOrders = containers.filter((c) => c.status === 'exported').length;
    const inStorage = containers.filter((c) => c.status === 'in_storage').length;
    const revenueThisYear = containers
      .filter((c) => c.status === 'exported' && c.export_date && new Date(c.export_date).getFullYear() === currentYear)
      .reduce((sum, c) => sum + Number(c.weight_kg || 0) * rateFor(c.cargo_type || 'Khác'), 0);

    // Demo capacity: nếu vượt ngưỡng sẽ hiện cảnh báo
    const warehouseCapacity = 20;
    const alertCount = Math.max(0, inStorage - warehouseCapacity);

    return [
      { title: 'Tổng đơn hàng', value: totalOrders, icon: FileText, color: 'bg-blue-500', sub: 'Số đơn đã xuất' },
      { title: 'Container trong kho', value: inStorage, icon: Package, color: 'bg-indigo-500', sub: 'Số lượng đang lưu' },
      {
        title: 'Doanh thu năm nay',
        value: Math.round(revenueThisYear),
        icon: DollarSign,
        color: 'bg-green-500',
        sub: 'Ước tính theo cước',
      },
      {
        title: 'Cảnh báo từ hệ thống',
        value: alertCount,
        icon: AlertCircle,
        color: alertCount > 0 ? 'bg-yellow-500' : 'bg-gray-400',
        sub: alertCount > 0 ? 'Kho đang tiến gần ngưỡng' : 'Ổn định',
      },
    ];
  }, [containers, fees]);

  return (
    <AdminWarehouseManagementLayout
      headerTitle="Dashboard"
      children={
        <>
          <div className="page-title">Dashboard</div>
          <div className="page-subtitle">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</div>

      {error && (
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
          <div style={{ color: 'var(--danger)', fontWeight: 600, marginBottom: 8 }}>Có lỗi</div>
          <div style={{ color: 'var(--text2)' }}>{error}</div>
          <div style={{ marginTop: 12, display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary btn-sm" onClick={fetchData} disabled={loading}>
              Thử lại
            </button>
          </div>
        </div>
      )}

          {loading ? (
        <div className="card">
          <div className="card-subtitle">Đang tải dữ liệu...</div>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {statCards.map((stat, idx) => {
              const si =
                idx === 0 ? 'si-blue' : idx === 1 ? 'si-green' : idx === 2 ? 'si-purple' : 'si-red';
              return (
                <div className="stat-card" key={stat.title}>
                  <div>
                    <div className="stat-label">{stat.title}</div>
                    <div className="stat-value">
                      {stat.title === 'Doanh thu năm nay'
                        ? `₫${Number(stat.value).toLocaleString('vi-VN')}`
                        : stat.value}
                    </div>
                    <div className={`stat-sub ${idx === 3 && Number(stat.value) > 0 ? 'danger' : ''}`}>{stat.sub}</div>
                  </div>
                  <div className={`stat-icon ${si}`}>
                    {/* keep icon shape from demo-ish */}
                    <stat.icon width={22} height={22} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="charts-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Doanh thu theo tháng</div>
                  <div className="card-subtitle">Biểu đồ doanh thu 12 tháng gần nhất</div>
                </div>
              </div>
              <div style={{ position: 'relative', height: 220 }}>
                {/* Next step: swap Recharts into exact demo canvas look */}
                <div className="card-subtitle">
                  Tổng: {revenueChartData.reduce((s, x) => s + x.value, 0).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Đơn hàng theo tháng</div>
                  <div className="card-subtitle">Số lượng đơn hàng 12 tháng gần nhất</div>
                </div>
              </div>
              <div style={{ position: 'relative', height: 220 }}>
                <div className="card-subtitle">
                  Tổng: {ordersChartData.reduce((s, x) => s + x.value, 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="two-col">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Loại container lưu nhiều nhất</div>
                <Link to="/warehouse/admin/section/bao-cao-thong-ke" className="btn btn-secondary btn-sm">
                  Xem tất cả
                </Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Loại container</th>
                      <th>Trong kho</th>
                      <th>Doanh thu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length === 0 ? (
                      <tr>
                        <td colSpan={3} style={{ color: 'var(--text2)' }}>
                          Chưa có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((p) => (
                        <tr key={p.container_type}>
                          <td>{p.container_type}</td>
                          <td>{p.inStorageCount}</td>
                          <td>{Math.round(p.revenue).toLocaleString('vi-VN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Đơn hàng gần nhất</div>
                <Link to="/warehouse/admin/section/xuat-bao-cao" className="btn btn-secondary btn-sm">
                  Xem tất cả
                </Link>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã</th>
                      <th>Khách hàng</th>
                      <th>Ngày xuất</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExports.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ color: 'var(--text2)' }}>
                          Chưa có dữ liệu
                        </td>
                      </tr>
                    ) : (
                      recentExports.map((o) => (
                        <tr key={o.id}>
                          <td>
                            <code>{o.container_number}</code>
                          </td>
                          <td>{o.customer_name}</td>
                          <td>{new Date(o.export_date).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <span className="badge badge-info">✓ Đã xuất</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
          )}
        </>
      }
    />
  );
}
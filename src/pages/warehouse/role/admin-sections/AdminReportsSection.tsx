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
  container_type?: string;
  cargo_type: string;
  weight_kg: number;
  status: 'pending' | 'in_storage' | 'exported';
  created_at: string;
  export_date?: string;
  zone?: string;
  block?: string;
  customer_id?: string;
  customer_name?: string;
  // Fields phục vụ demo báo cáo hỏng/xuất chậm
  broken?: boolean;
  broken_type?: string;
  export_delay_days?: number;
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

type Mode = 'revenue_profit' | 'performance' | 'inventory' | 'customer_stats' | 'export_report' | 'damage_summary';

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
  hideTitle = false,
  focusDamageCategory,
}: {
  mode: Mode;
  showLayout?: boolean;
  hideTitle?: boolean;
  focusDamageCategory?: 'cold' | 'fragile' | 'dry' | 'all';
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

  // Dùng chung cho export_report: export danh sách đơn hàng (orders) theo khoảng ngày.
  const [exportType, setExportType] = useState<'orders' | 'revenue_profit' | 'inventory' | 'customer_stats' | 'performance'>('orders');

  useEffect(() => {
    if (mode === 'export_report') setExportType('orders');
  }, [mode]);

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

  const customerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of users) {
      if (u.role !== 'customer') continue;
      map.set(u.id, u.name);
    }
    return map;
  }, [users]);

  const rateFor = (cargoType: string) => {
    const cost = fees || {};
    const by = cost.ratePerKgByCargoType || {};
    if (typeof by[cargoType] === 'number') return by[cargoType];
    return typeof cost.ratePerKgDefault === 'number' ? cost.ratePerKgDefault : 0;
  };

  const costRate = typeof fees?.costRate === 'number' ? fees!.costRate : 0.35;

  // Demo: quy đổi hỏng + xuất chậm để trừ vào doanh thu
  const brokenPenaltyPct = 0.05; // phạt theo % doanh thu gộp của container bị hỏng
  const delayFeePerDay = 200000; // phí đền xuất chậm theo ngày (VND)

  // Revenue/profit estimation (net revenue = gross - phạt hỏng - đền xuất chậm)
  const revenueProfit = useMemo(() => {
    const grossRevenue = exportedInRange.reduce(
      (sum, c) => sum + Number(c.weight_kg || 0) * rateFor(c.cargo_type),
      0,
    );

    const brokenPenalty = exportedInRange.reduce((sum, c) => {
      if (!c.broken) return sum;
      const gross = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      return sum + gross * brokenPenaltyPct;
    }, 0);

    const delayFee = exportedInRange.reduce((sum, c) => {
      const days = typeof c.export_delay_days === 'number' ? c.export_delay_days : Number(c.export_delay_days || 0);
      return sum + (Number.isFinite(days) ? days : 0) * delayFeePerDay;
    }, 0);

    const netRevenue = grossRevenue - brokenPenalty - delayFee;
    const cost = netRevenue * costRate;
    const profit = netRevenue - cost;
    return { revenue: netRevenue, grossRevenue, brokenPenalty, delayFee, cost, profit };
  }, [exportedInRange, fees, costRate]);

  const revenueByDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of exportedInRange) {
      if (!c.export_date) continue;
      const d = new Date(c.export_date);
      const key = toISODate(d);
      const gross = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      const brokenPenalty = c.broken ? gross * brokenPenaltyPct : 0;
      const days = typeof c.export_delay_days === 'number' ? c.export_delay_days : Number(c.export_delay_days || 0);
      const delayFee = (Number.isFinite(days) ? days : 0) * delayFeePerDay;
      const amount = gross - brokenPenalty - delayFee;
      map.set(key, (map.get(key) || 0) + amount);
    }
    return Array.from(map.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [exportedInRange, fees]);

  const revenueByCustomer = useMemo(() => {
    const map = new Map<string, { customer_id: string; customer_name: string; revenue: number; count: number }>();
    for (const c of exportedInRange) {
      const customerId = c.customer_id || '';
      const key = customerId || c.customer_name || c.customer_number || 'unknown';
      const name =
        c.customer_name ||
        (customerId ? customerNameMap.get(customerId) : undefined) ||
        c.customer_id ||
        key;
      const prev = map.get(key) || { customer_id: key, customer_name: name, revenue: 0, count: 0 };
      const gross = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      const brokenPenalty = c.broken ? gross * brokenPenaltyPct : 0;
      const days = typeof c.export_delay_days === 'number' ? c.export_delay_days : Number(c.export_delay_days || 0);
      const delayFee = (Number.isFinite(days) ? days : 0) * delayFeePerDay;
      prev.revenue += gross - brokenPenalty - delayFee;
      prev.count += 1;
      map.set(key, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [exportedInRange, fees, customerNameMap]);

  const revenueByContainerType = useMemo(() => {
    const map = new Map<
      string,
      {
        container_type: string;
        count: number;
        gross: number;
        brokenPenalty: number;
        delayFee: number;
        net: number;
      }
    >();

    for (const c of exportedInRange) {
      const type = c.container_type || 'Khác';
      const prev =
        map.get(type) || {
          container_type: type,
          count: 0,
          gross: 0,
          brokenPenalty: 0,
          delayFee: 0,
          net: 0,
        };

      const gross = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      const brokenPenalty = c.broken ? gross * brokenPenaltyPct : 0;
      const days = typeof c.export_delay_days === 'number' ? c.export_delay_days : Number(c.export_delay_days || 0);
      const delayFee = (Number.isFinite(days) ? days : 0) * delayFeePerDay;
      const net = gross - brokenPenalty - delayFee;

      prev.count += 1;
      prev.gross += gross;
      prev.brokenPenalty += brokenPenalty;
      prev.delayFee += delayFee;
      prev.net += net;

      map.set(type, prev);
    }

    return Array.from(map.values()).sort((a, b) => b.net - a.net);
  }, [exportedInRange, fees]);

  const gateByMonth = useMemo(() => {
    const startMonth = new Date(range.start);
    startMonth.setDate(1);
    startMonth.setHours(0, 0, 0, 0);

    const endMonth = new Date(range.end);
    endMonth.setDate(1);
    endMonth.setHours(0, 0, 0, 0);

    const startIdx = startMonth.getFullYear() * 12 + startMonth.getMonth();
    const endIdx = endMonth.getFullYear() * 12 + endMonth.getMonth();
    const effectiveStartIdx = Math.max(endIdx - 11, startIdx);

    const map = new Map<number, { gateIn: number; gateOut: number; gateBroken: number }>();
    for (let idx = effectiveStartIdx; idx <= endIdx; idx++) {
      map.set(idx, { gateIn: 0, gateOut: 0, gateBroken: 0 });
    }

    // Gate vào: container chưa xuất (pending/in_storage) theo created_at
    for (const c of importedInRange) {
      if (c.status === 'exported') continue;
      const d = new Date(c.created_at);
      const idx = d.getFullYear() * 12 + d.getMonth();
      if (idx < effectiveStartIdx || idx > endIdx) continue;
      const v = map.get(idx);
      if (!v) continue;
      v.gateIn += 1;
    }

    // Gate ra: container đã xuất theo export_date
    for (const c of exportedInRange) {
      if (!c.export_date) continue;
      const d = new Date(c.export_date);
      const idx = d.getFullYear() * 12 + d.getMonth();
      if (idx < effectiveStartIdx || idx > endIdx) continue;
      const v = map.get(idx);
      if (!v) continue;
      v.gateOut += 1;
      if (c.broken) v.gateBroken += 1;
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([idx, v]) => {
        const year = Math.floor(idx / 12);
        const month = idx % 12;
        const name = `${year}-${String(month + 1).padStart(2, '0')}`;
        return { name, ...v };
      });
  }, [importedInRange, exportedInRange, range.start, range.end]);

  const cargoPieData = useMemo(() => {
    const map = new Map<string, number>();
    let brokenCount = 0;

    for (const c of exportedInRange) {
      if (c.broken) {
        brokenCount += 1;
        continue;
      }
      const name = c.cargo_type || 'Khác';
      map.set(name, (map.get(name) || 0) + 1);
    }

    const data = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
    if (brokenCount > 0) data.push({ name: 'Hàng hỏng', value: brokenCount });
    return data.sort((a, b) => b.value - a.value).slice(0, 7);
  }, [exportedInRange]);

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

  const ordersInRange = useMemo(() => {
    // Demo: gom "đơn" theo (ngày xuất + khách hàng) từ các container đã export.
    const map = new Map<
      string,
      {
        orderCode: string;
        customer: string;
        orderDate: string;
        containers: ContainerItem[];
        netTotal: number;
      }
    >();

    for (const c of exportedInRange) {
      if (!c.export_date) continue;

      const orderDate = toISODate(new Date(c.export_date));
      const customerKey = c.customer_id || c.customer_name || 'unknown';
      const customer =
        c.customer_name || (c.customer_id ? customerNameMap.get(c.customer_id) : undefined) || customerKey;
      const key = `${orderDate}__${customerKey}`;

      const prev = map.get(key) || {
        orderCode: `ORD-${orderDate.replace(/-/g, '')}-${String(customerKey).slice(0, 6)}`,
        customer,
        orderDate,
        containers: [],
        netTotal: 0,
      };

      const gross = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      const brokenPenalty = c.broken ? gross * brokenPenaltyPct : 0;
      const days = typeof c.export_delay_days === 'number' ? c.export_delay_days : Number(c.export_delay_days || 0);
      const delayFee = (Number.isFinite(days) ? days : 0) * delayFeePerDay;
      const net = gross - brokenPenalty - delayFee;

      prev.containers = [...prev.containers, c];
      prev.netTotal += net;
      map.set(key, prev);
    }

    return Array.from(map.values()).sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [exportedInRange, fees, customerNameMap]);

  const damagedContainersInRange = useMemo(() => {
    // "Hỏng" lấy từ các container đã xuất trong khoảng ngày (export_date).
    return exportedInRange.filter((c) => !!c.broken);
  }, [exportedInRange]);

  const damagedTypeOptions = useMemo(() => {
    const set = new Set<string>();
    for (const c of damagedContainersInRange) {
      set.add(c.broken_type || c.cargo_type || 'Khác');
    }
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [damagedContainersInRange]);

  const damagedSummaryByType = useMemo(() => {
    const map = new Map<string, { type: string; count: number }>();
    for (const c of damagedContainersInRange) {
      const type = c.broken_type || c.cargo_type || 'Khác';
      const prev = map.get(type) || { type, count: 0 };
      prev.count += 1;
      map.set(type, prev);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [damagedContainersInRange]);

  const [damagedTypeFilter, setDamagedTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!focusDamageCategory) return;
    if (focusDamageCategory === 'all') {
      setDamagedTypeFilter('all');
      return;
    }
    const keyword = focusDamageCategory === 'cold' ? 'lạnh' : focusDamageCategory === 'fragile' ? 'vỡ' : 'khô';
    const matched = damagedTypeOptions.find((opt) => opt.toLowerCase().includes(keyword));
    if (matched) setDamagedTypeFilter(matched);
  }, [focusDamageCategory, damagedTypeOptions]);

  const filteredDamagedContainers = useMemo(() => {
    if (damagedTypeFilter === 'all') return damagedContainersInRange;
    return damagedContainersInRange.filter((c) => (c.broken_type || c.cargo_type || 'Khác') === damagedTypeFilter);
  }, [damagedContainersInRange, damagedTypeFilter]);

  const damagedCompensationMoney = useMemo(() => {
    // "Tiền bồi thường": demo theo phạt% trên gross doanh thu của container bị hỏng.
    return filteredDamagedContainers.reduce((sum, c) => {
      const gross = Number(c.weight_kg || 0) * rateFor(c.cargo_type);
      return sum + (gross * brokenPenaltyPct);
    }, 0);
  }, [filteredDamagedContainers, fees]);

  const damagedOrdersCount = useMemo(() => {
    // Đơn bị ảnh hưởng: có ít nhất 1 container bị hỏng (tương ứng filter loại hỏng).
    const damagedTypesOfFiltered = new Set(
      filteredDamagedContainers.map((c) => c.id),
    );

    const count = ordersInRange.reduce((acc, o) => {
      const has = o.containers.some((c) => damagedTypesOfFiltered.has(c.id));
      return acc + (has ? 1 : 0);
    }, 0);

    return count;
  }, [ordersInRange, filteredDamagedContainers]);

  const damagedRatioPct = useMemo(() => {
    const totalExported = exportedInRange.length;
    if (!totalExported) return 0;
    return (filteredDamagedContainers.length / totalExported) * 100;
  }, [exportedInRange, filteredDamagedContainers]);

  useEffect(() => {
    // Reset filter khi đổi khoảng ngày để demo dễ hiểu hơn.
    setDamagedTypeFilter('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const exportDataForType = () => {
    const formatMoney = (n: number) => Math.round(n).toString();
    if (exportType === 'orders') {
      return {
        type: 'orders',
        range: { startDate, endDate },
        orders: ordersInRange.map((o) => {
          const hasBroken = o.containers.some((c) => !!c.broken);
          const hasDelay = o.containers.some((c) => (typeof c.export_delay_days === 'number' ? c.export_delay_days : Number(c.export_delay_days || 0)) > 0);
          const status = hasBroken ? 'Có hàng hỏng' : hasDelay ? 'Xuất chậm' : 'Đã xuất';
          return {
            orderCode: o.orderCode,
            customer: o.customer,
            orderDate: o.orderDate,
            containerCount: o.containers.length,
            total: formatMoney(o.netTotal),
            status,
          };
        }),
      };
    }

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
    if (exportType === 'orders') {
      csv = ['orderCode,customer,orderDate,containerCount,total,status']
        .concat(
          (payload.orders || []).map((r: any) => `${r.orderCode},${r.customer},${r.orderDate},${r.containerCount},${r.total},${r.status}`),
        )
        .join('\n');
    } else if (exportType === 'revenue_profit') {
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
        {
          title: 'Doanh thu ước tính (net)',
          value: Math.round(revenueProfit.revenue).toLocaleString('vi-VN'),
          sub: `Trừ phạt hỏng ${Math.round(revenueProfit.brokenPenalty).toLocaleString('vi-VN')} | Đền xuất chậm ${Math.round(revenueProfit.delayFee).toLocaleString('vi-VN')}`,
          icon: TrendingUp,
          color: 'bg-blue-500',
        },
        { title: 'Chi phí ước tính', value: Math.round(revenueProfit.cost).toLocaleString('vi-VN'), icon: Settings, color: 'bg-yellow-500' },
        { title: 'Lợi nhuận ước tính (net)', value: Math.round(revenueProfit.profit).toLocaleString('vi-VN'), icon: PieChartIcon, color: 'bg-green-500' },
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
      case 'damage_summary':
        return 'Tổng hợp hàng hỏng';
      default:
        return 'Báo cáo';
    }
  })();

  const page = (
      <div className="space-y-6">
        {!hideTitle && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{headerTitle}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Dữ liệu được tính từ `containers` + cấu hình cước phí.</p>
          </div>
        )}

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
                  <div className="text-sm font-medium text-gray-700">Chế độ</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Danh sách đơn hàng</div>
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
                              {('sub' in c && (c as any).sub) ? (
                                <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">
                                  {(c as any).sub}
                                </div>
                              ) : null}
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
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-600" />
                        Xuất dữ liệu đơn hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Xuất dạng `JSON` hoặc `CSV`.
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="bg-blue-900 hover:bg-blue-800 text-white" onClick={downloadJSON}>
                          Xuất JSON
                        </Button>
                        <Button variant="outline" onClick={downloadCSV}>
                          Xuất CSV
                        </Button>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Badge className="ml-0">{exportType}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById('damage-summary')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                          Tới tổng hợp hàng hỏng
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Tóm tắt khoảng ngày</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Số đơn</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">{ordersInRange.length}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Số container</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {ordersInRange.reduce((s, o) => s + o.containers.length, 0)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Tổng (net)</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {Math.round(ordersInRange.reduce((s, o) => s + o.netTotal, 0)).toLocaleString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách đơn hàng</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã đơn</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Ngày xuất</TableHead>
                          <TableHead className="text-right">Số container</TableHead>
                          <TableHead className="text-right">Tổng (net)</TableHead>
                          <TableHead>Trạng thái</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ordersInRange.map((o) => {
                          const hasBroken = o.containers.some((c) => !!c.broken);
                          const hasDelay = o.containers.some(
                            (c) =>
                              (typeof c.export_delay_days === 'number' ? c.export_delay_days : Number(c.export_delay_days || 0)) > 0,
                          );
                          const status = hasBroken ? 'Có hàng hỏng' : hasDelay ? 'Xuất chậm' : 'Đã xuất';
                          const statusClass = hasBroken
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            : hasDelay
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';

                          return (
                            <TableRow key={o.orderCode}>
                              <TableCell className="font-semibold">{o.orderCode}</TableCell>
                              <TableCell>{o.customer}</TableCell>
                              <TableCell>{o.orderDate}</TableCell>
                              <TableCell className="text-right">{o.containers.length}</TableCell>
                              <TableCell className="text-right">{Math.round(o.netTotal).toLocaleString('vi-VN')}</TableCell>
                              <TableCell>
                                <Badge className={statusClass}>{status}</Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}

                        {ordersInRange.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center text-gray-500 py-10">
                              Chưa có đơn hàng trong khoảng.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div id="damage-summary" className="pt-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tổng hợp hàng hỏng</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setDamagedTypeFilter('all')}
                            className={`rounded-full px-4 py-2 text-sm border ${damagedTypeFilter === 'all' ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
                          >
                            Tất cả
                          </button>
                          {damagedTypeOptions.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setDamagedTypeFilter(t)}
                              className={`rounded-full px-4 py-2 text-sm border ${damagedTypeFilter === t ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">Lọc theo loại hỏng</div>
                            <Select value={damagedTypeFilter} onValueChange={setDamagedTypeFilter}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                {damagedTypeOptions.map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {t}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {filteredDamagedContainers.length} container hỏng
                          </div>
                        </div>
                      </div>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Mã container</TableHead>
                            <TableHead>Khách hàng</TableHead>
                            <TableHead>Loại hàng</TableHead>
                            <TableHead>Ngày xuất</TableHead>
                            <TableHead>Trạng thái hỏng</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredDamagedContainers.map((c) => (
                            <TableRow key={c.id}>
                              <TableCell className="font-semibold">{c.container_number}</TableCell>
                              <TableCell>
                                {c.customer_name ||
                                  (c.customer_id ? customerNameMap.get(c.customer_id) : undefined) ||
                                  c.customer_id ||
                                  '—'}
                              </TableCell>
                              <TableCell>{c.broken_type || c.cargo_type || 'Khác'}</TableCell>
                              <TableCell>{c.export_date ? toISODate(new Date(c.export_date)) : '—'}</TableCell>
                              <TableCell>
                                <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Hỏng</Badge>
                              </TableCell>
                            </TableRow>
                          ))}

                          {filteredDamagedContainers.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                                Không có hàng hỏng phù hợp bộ lọc.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <div className="pt-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          Top loại hỏng (theo số container)
                        </div>
                        <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Loại hỏng</TableHead>
                            <TableHead className="text-right">Số lượng</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {damagedSummaryByType.slice(0, 6).map((row) => (
                            <TableRow key={row.type}>
                              <TableCell>{row.type}</TableCell>
                              <TableCell className="text-right">{row.count}</TableCell>
                            </TableRow>
                          ))}
                          {damagedSummaryByType.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center text-gray-500 py-10">
                                Chưa có dữ liệu hỏng.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* DAMAGE SUMMARY */}
            {mode === 'damage_summary' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tổng hợp hàng hỏng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Tổng hàng hỏng</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{filteredDamagedContainers.length}</div>
                      </div>
                      <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Tiền bồi thường (demo)</div>
                        <div className="text-2xl font-bold text-red-600 mt-1">
                          {Math.round(damagedCompensationMoney).toLocaleString('vi-VN')}
                        </div>
                      </div>
                      <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Đơn bị ảnh hưởng</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{damagedOrdersCount}</div>
                      </div>
                      <div className="rounded-xl border bg-white dark:bg-gray-800 p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300">Tỷ lệ hỏng</div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">{damagedRatioPct.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Lọc theo loại hỏng</div>
                        <Select value={damagedTypeFilter} onValueChange={setDamagedTypeFilter}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tất cả</SelectItem>
                            {damagedTypeOptions.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {filteredDamagedContainers.length} container hỏng
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mã container</TableHead>
                          <TableHead>Khách hàng</TableHead>
                          <TableHead>Loại hàng</TableHead>
                          <TableHead>Ngày xuất</TableHead>
                          <TableHead>Trạng thái hỏng</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredDamagedContainers.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-semibold">{c.container_number}</TableCell>
                            <TableCell>
                              {c.customer_name ||
                                (c.customer_id ? customerNameMap.get(c.customer_id) : undefined) ||
                                c.customer_id ||
                                '—'}
                            </TableCell>
                            <TableCell>{c.broken_type || c.cargo_type || 'Khác'}</TableCell>
                            <TableCell>{c.export_date ? toISODate(new Date(c.export_date)) : '—'}</TableCell>
                            <TableCell>
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Hỏng</Badge>
                            </TableCell>
                          </TableRow>
                        ))}

                        {filteredDamagedContainers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                              Không có hàng hỏng phù hợp bộ lọc.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>

                    <div className="pt-2">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Top loại hỏng (theo số container)
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Loại hỏng</TableHead>
                            <TableHead className="text-right">Số lượng</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {damagedSummaryByType.slice(0, 6).map((row) => (
                            <TableRow key={row.type}>
                              <TableCell>{row.type}</TableCell>
                              <TableCell className="text-right">{row.count}</TableCell>
                            </TableRow>
                          ))}
                          {damagedSummaryByType.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={2} className="text-center text-gray-500 py-10">
                                Chưa có dữ liệu hỏng.
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

            {/* REVENUE PROFIT */}
            {mode === 'revenue_profit' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Biểu đồ hoạt động gate theo tháng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={gateByMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="gateIn" stroke="#3b82f6" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="gateOut" stroke="#22c55e" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="gateBroken" stroke="#7c3aed" strokeWidth={2} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Phân bổ theo loại hàng (kèm hàng hỏng)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={cargoPieData}
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
                        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Top khách hàng (net)</div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Khách hàng</TableHead>
                              <TableHead className="text-right">Xuất</TableHead>
                              <TableHead className="text-right">Doanh thu (net)</TableHead>
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

                <Card>
                  <CardHeader>
                    <CardTitle>Doanh thu net theo loại container (tổng tiền từng loại)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Loại container</TableHead>
                            <TableHead className="text-right">Số container</TableHead>
                            <TableHead className="text-right">Gross</TableHead>
                            <TableHead className="text-right">Phạt hỏng</TableHead>
                            <TableHead className="text-right">Đền xuất chậm</TableHead>
                            <TableHead className="text-right">Net</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {revenueByContainerType.slice(0, 10).map((r) => (
                            <TableRow key={r.container_type}>
                              <TableCell className="font-semibold">{r.container_type}</TableCell>
                              <TableCell className="text-right">{r.count}</TableCell>
                              <TableCell className="text-right">{Math.round(r.gross).toLocaleString('vi-VN')}</TableCell>
                              <TableCell className="text-right">{Math.round(r.brokenPenalty).toLocaleString('vi-VN')}</TableCell>
                              <TableCell className="text-right">{Math.round(r.delayFee).toLocaleString('vi-VN')}</TableCell>
                              <TableCell className="text-right">{Math.round(r.net).toLocaleString('vi-VN')}</TableCell>
                            </TableRow>
                          ))}
                          {revenueByContainerType.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-gray-500 py-10">
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


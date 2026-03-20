import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';
import {
  Container, Users, TrendingUp, Package, BarChart3, Calendar,
  Activity, Settings, Bell, FileText, Truck, RefreshCw, AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Link } from 'react-router';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
  const { user, token } = useWarehouseAuth();
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token || publicAnonKey}` };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/dashboard/stats`, { headers }),
        fetch(`${apiUrl}/users`, { headers }),
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();

      if (!statsRes.ok) throw new Error(statsData.error || 'Lỗi lấy thống kê');

      setStats(statsData.stats);
      setActivities(statsData.activities || []);
      setUserCount(usersData.users?.length || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [token]);

  const statCards = stats ? [
    { title: 'Tổng Container', value: stats.total, icon: Container, color: 'bg-blue-500', sub: 'container trong hệ thống' },
    { title: 'Đang lưu kho', value: stats.in_storage, icon: Package, color: 'bg-indigo-500', sub: 'container đang lưu' },
    { title: 'Chờ xử lý', value: stats.pending, icon: TrendingUp, color: 'bg-yellow-500', sub: 'container chờ xử lý' },
    { title: 'Người dùng', value: userCount, icon: Users, color: 'bg-green-500', sub: 'tài khoản trong hệ thống' },
  ] : [];

  const barData = stats ? [
    { name: 'Chờ xử lý', value: stats.pending, fill: '#f59e0b' },
    { name: 'Lưu kho', value: stats.in_storage, fill: '#3b82f6' },
    { name: 'Đã xuất', value: stats.exported, fill: '#22c55e' },
  ] : [];

  const pieData = stats?.by_zone
    ? Object.entries(stats.by_zone).map(([name, value]) => ({ name: `Zone ${name}`, value }))
    : [];

  const quickActions = [
    { title: 'Quản lý Container', icon: Container, href: '/warehouse/containers', color: 'bg-blue-500' },
    { title: 'Quản lý Người dùng', icon: Users, href: '/warehouse/users', color: 'bg-green-500' },
    { title: 'Báo cáo', icon: FileText, href: '/warehouse/containers', color: 'bg-orange-500' },
    { title: 'Cài đặt', icon: Settings, href: '/warehouse/admin/dashboard', color: 'bg-gray-500' },
  ];

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Quản trị viên</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Chào mừng, <span className="font-semibold">{user?.name}</span> · Dữ liệu thời gian thực từ Supabase
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Link to="/warehouse/containers">
              <Button className="gap-2 bg-blue-700 hover:bg-blue-800">
                <Container className="w-4 h-4" /> Quản lý Container
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
              {statCards.map((stat, index) => (
                <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card>
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
                </motion.div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Trạng thái */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" /> Thống kê theo trạng thái
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {barData.length > 0 && barData.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={barData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {barData.map((entry, i) => (
                            <Cell key={i} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[220px] text-gray-400">
                      Chưa có dữ liệu container
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart - Theo khu vực */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" /> Phân bổ theo khu vực
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[220px] text-gray-400">
                      Chưa có dữ liệu container
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, index) => (
                    <motion.div key={action.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                      <Link to={action.href}
                        className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group">
                        <div className={`${action.color} p-4 rounded-lg group-hover:scale-110 transition-transform`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">{action.title}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            {activities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Hoạt động gần đây</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.map((activity, index) => (
                      <motion.div key={activity.id || index}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                        className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          activity.action_type === 'create' ? 'bg-green-500' :
                          activity.action_type === 'delete' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(activity.created_at).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </WarehouseLayout>
  );
}
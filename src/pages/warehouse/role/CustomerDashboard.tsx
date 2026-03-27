import { motion } from 'motion/react';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';
import { 
  Container,
  Package,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Search,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';

export default function CustomerDashboard() {
  const { user } = useWarehouseAuth();

  const stats = [
    { 
      title: 'Container của tôi', 
      value: '24', 
      icon: Container, 
      color: 'bg-blue-500'
    },
    { 
      title: 'Đơn hàng đang xử lý', 
      value: '6', 
      icon: Package, 
      color: 'bg-yellow-500'
    },
    { 
      title: 'Thanh toán chờ', 
      value: '₫12.5M', 
      icon: DollarSign, 
      color: 'bg-green-500'
    },
    { 
      title: 'Thời gian lưu trung bình', 
      value: '4.5 ngày', 
      icon: Clock, 
      color: 'bg-purple-500'
    },
  ];

  const myContainers = [
    {
      id: 1,
      code: 'CMAU4567890',
      status: 'Đang lưu kho',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      location: 'Khu A - Vị trí 23',
      arrivalDate: '15/11/2024',
      daysInStorage: 12,
      size: '40ft',
      type: 'Khô',
      fee: '₫450K',
    },
    {
      id: 2,
      code: 'HLCU3456789',
      status: 'Sẵn sàng xuất',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      location: 'Khu B - Vị trí 45',
      arrivalDate: '20/11/2024',
      daysInStorage: 7,
      size: '20ft',
      type: 'Khô',
      fee: '₫380K',
    },
    {
      id: 3,
      code: 'MSCU2345678',
      status: 'Đang lưu kho',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      location: 'Khu C - Vị trí 12',
      arrivalDate: '10/11/2024',
      daysInStorage: 17,
      size: '40ft',
      type: 'Lạnh',
      fee: '₫720K',
    },
    {
      id: 4,
      code: 'VSCU1122334',
      status: 'Đang xuất',
      badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      location: 'Khu B - Vị trí 08',
      arrivalDate: '22/11/2024',
      daysInStorage: 5,
      size: '20ft',
      type: 'Khô',
      fee: '₫310K',
    },
    {
      id: 5,
      code: 'TIPU9988776',
      status: 'Đang lưu kho',
      badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
      location: 'Khu D - Vị trí 19',
      arrivalDate: '01/11/2024',
      daysInStorage: 24,
      size: '40ft',
      type: 'Hỏng',
      fee: '₫1.1M',
    },
    {
      id: 6,
      code: 'TGHU2233445',
      status: 'Đang lưu kho',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      location: 'Khu E - Vị trí 03',
      arrivalDate: '08/11/2024',
      daysInStorage: 16,
      size: '20ft',
      type: 'Dễ vỡ',
      fee: '₫620K',
    },
  ];

  const recentOrders = [
    {
      id: '#ORD-2024-1156',
      type: 'Nhập kho',
      date: '25/11/2024',
      status: 'Hoàn thành',
      containers: 2,
      total: '₫890K'
    },
    {
      id: '#ORD-2024-1089',
      type: 'Xuất kho',
      date: '18/11/2024',
      status: 'Đang xử lý',
      containers: 1,
      total: '₫450K'
    },
    {
      id: '#ORD-2024-1034',
      type: 'Nhập kho',
      date: '12/11/2024',
      status: 'Hoàn thành',
      containers: 3,
      total: '₫1.34M'
    },
  ];

  const notifications = [
    { id: 1, type: 'warning', message: 'Container CMAU4567890 sắp hết thời gian lưu miễn phí', time: '2 giờ trước' },
    { id: 2, type: 'info', message: 'Container HLCU3456789 đã sẵn sàng xuất cảng', time: '5 giờ trước' },
    { id: 3, type: 'success', message: 'Thanh toán đơn hàng #ORD-2024-1156 thành công', time: '1 ngày trước' },
  ];

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title">Dashboard Khách hàng</h1>
            <p className="page-subtitle">
              Chào mừng <span className="font-semibold">{user?.name || 'Khách hàng'}</span> đến với kho hàng của bạn.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="outline" className="gap-2">
              <Bell className="w-4 h-4" />
              Thông báo
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Package className="w-4 h-4" />
              Đặt dịch vụ
            </Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_0.95fr]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</h3>
                      </div>
                      <div className={`${stat.color} p-3 rounded-2xl`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Thông báo mới
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      notification.type === 'warning'
                        ? 'bg-yellow-500'
                        : notification.type === 'success'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    }`} />
                    <p className="text-sm text-gray-900 dark:text-white">{notification.message}</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{notification.time}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tra cứu nhanh container</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tìm container theo mã, trạng thái hoặc vị trí.</p>
              </div>
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input placeholder="Tìm kiếm container..." className="pl-10 h-12" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Tổng hợp kho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Container khô</div>
                <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">18</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Container hiện có</p>
              </div>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Container lạnh</div>
                <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">5</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Container hiện có</p>
              </div>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Container hỏng</div>
                <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">2</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Container hiện có</p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Container dễ vỡ</div>
                <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">1</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Container hiện có</p>
              </div>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Container khác</div>
                <div className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">4</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Container hiện có</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
              <CardTitle className="flex items-center gap-2">
                <Container className="w-5 h-5" />
                Container của tôi
              </CardTitle>
              <div className="text-sm text-gray-500 dark:text-gray-400">Hiển thị 6 container gần đây, kéo xuống để xem thêm</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[520px] overflow-y-auto pr-2">
            {myContainers.map((container, index) => (
              <motion.div
                key={container.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="rounded-3xl bg-blue-500 p-3 text-white">
                      <Container className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{container.code}</h3>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${container.badge}`}>{container.status}</span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{container.location}</div>
                        <div>Loại: {container.size} {container.type}</div>
                        <div>Ngày nhập: {container.arrivalDate}</div>
                        <div>Thời gian lưu: {container.daysInStorage} ngày</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{container.fee}</div>
                    <Button size="sm" variant="outline">Chi tiết</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>
    </WarehouseLayout>
  );
}

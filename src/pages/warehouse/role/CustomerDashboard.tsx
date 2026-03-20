import { motion } from 'motion/react';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';
import { 
  Container,
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  FileText,
  Download,
  Search,
  Bell
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
      value: '$12,540', 
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
      status: 'in-storage',
      location: 'Khu A - Vị trí 23',
      arrivalDate: '15/11/2024',
      daysInStorage: 12,
      size: '40ft',
      type: 'Dry',
      fees: '$450'
    },
    {
      id: 2,
      code: 'HLCU3456789',
      status: 'ready-export',
      location: 'Khu B - Vị trí 45',
      arrivalDate: '20/11/2024',
      daysInStorage: 7,
      size: '20ft',
      type: 'Dry',
      fees: '$280'
    },
    {
      id: 3,
      code: 'MSCU2345678',
      status: 'in-storage',
      location: 'Khu C - Vị trí 12',
      arrivalDate: '10/11/2024',
      daysInStorage: 17,
      size: '40ft',
      type: 'Reefer',
      fees: '$720'
    },
  ];

  const recentOrders = [
    {
      id: '#ORD-2024-1156',
      type: 'import',
      date: '25/11/2024',
      status: 'completed',
      containers: 2,
      total: '$890'
    },
    {
      id: '#ORD-2024-1089',
      type: 'export',
      date: '18/11/2024',
      status: 'in-progress',
      containers: 1,
      total: '$450'
    },
    {
      id: '#ORD-2024-1034',
      type: 'import',
      date: '12/11/2024',
      status: 'completed',
      containers: 3,
      total: '$1,340'
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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Khách hàng
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Chào mừng <span className="font-semibold">{user?.name}</span> từ <span className="font-semibold">{user?.company || 'Công ty của bạn'}</span>
            </p>
          </div>
          <div className="flex gap-3">
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search Container */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Tìm kiếm container theo mã số..."
                  className="pl-10 h-12"
                />
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Tra cứu
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* My Containers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Container className="w-5 h-5" />
              Container của tôi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myContainers.map((container, index) => (
                <motion.div
                  key={container.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-500 rounded-lg">
                        <Container className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {container.code}
                          </h3>
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            container.status === 'ready-export'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {container.status === 'ready-export' ? 'Sẵn sàng xuất' : 'Đang lưu kho'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span>{container.location}</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Loại:</span> {container.size} {container.type}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Ngày nhập:</span> {container.arrivalDate}
                          </div>
                          <div className="text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Thời gian lưu:</span> {container.daysInStorage} ngày
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xl font-bold text-gray-900 dark:text-white">
                        {container.fees}
                      </div>
                      <Button size="sm" variant="outline">
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Đơn hàng gần đây
                </CardTitle>
                <Button variant="link" size="sm">
                  Xem tất cả
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        order.type === 'import' ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {order.id}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {order.date} • {order.containers} containers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {order.total}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {order.status === 'completed' ? 'Hoàn thành' : 'Đang xử lý'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Thông báo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Liên kết nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <Download className="w-6 h-6" />
                <span className="text-sm">Tải tài liệu</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <DollarSign className="w-6 h-6" />
                <span className="text-sm">Thanh toán</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <FileText className="w-6 h-6" />
                <span className="text-sm">Báo giá</span>
              </Button>
              <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                <TrendingUp className="w-6 h-6" />
                <span className="text-sm">Thống kê</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </WarehouseLayout>
  );
}

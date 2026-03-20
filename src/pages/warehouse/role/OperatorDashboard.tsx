import { motion } from 'motion/react';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';
import { 
  Container,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  Package,
  AlertTriangle,
  Scan,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';

export default function OperatorDashboard() {
  const { user } = useWarehouseAuth();

  const stats = [
    { 
      title: 'Nhiệm vụ hôm nay', 
      value: '18', 
      icon: Package, 
      color: 'bg-blue-500'
    },
    { 
      title: 'Đã hoàn thành', 
      value: '12', 
      icon: CheckCircle, 
      color: 'bg-green-500'
    },
    { 
      title: 'Đang thực hiện', 
      value: '4', 
      icon: Clock, 
      color: 'bg-yellow-500'
    },
    { 
      title: 'Cần xử lý', 
      value: '2', 
      icon: AlertTriangle, 
      color: 'bg-red-500'
    },
  ];

  const currentTasks = [
    {
      id: 1,
      container: 'CMAU4567890',
      type: 'import',
      status: 'in-progress',
      location: 'Bến 3 - Cổng A',
      startTime: '09:30',
      customer: 'Công ty ABC',
      size: '40ft',
      weight: '24,000 kg'
    },
    {
      id: 2,
      container: 'HLCU3456789',
      type: 'export',
      status: 'in-progress',
      location: 'Khu B - Vị trí 45',
      startTime: '10:15',
      customer: 'Công ty XYZ',
      size: '20ft',
      weight: '18,500 kg'
    },
  ];

  const pendingTasks = [
    {
      id: 3,
      container: 'MSCU2345678',
      type: 'import',
      priority: 'high',
      scheduledTime: '11:00',
      customer: 'Công ty DEF',
      size: '40ft',
      notes: 'Hàng lạnh, cần xử lý ưu tiên'
    },
    {
      id: 4,
      container: 'TGHU5678901',
      type: 'export',
      priority: 'medium',
      scheduledTime: '13:30',
      customer: 'Công ty GHI',
      size: '20ft',
      notes: ''
    },
    {
      id: 5,
      container: 'OOLU6789012',
      type: 'import',
      priority: 'medium',
      scheduledTime: '14:00',
      customer: 'Công ty JKL',
      size: '40ft',
      notes: ''
    },
  ];

  const completedToday = [
    { id: 1, container: 'YMLU1234567', type: 'export', time: '08:45', customer: 'Công ty MNO' },
    { id: 2, container: 'APZU2345678', type: 'import', time: '08:15', customer: 'Công ty PQR' },
    { id: 3, container: 'CAXU3456789', type: 'export', time: '07:30', customer: 'Công ty STU' },
  ];

  const quickActions = [
    { title: 'Quét QR Container', icon: Scan, action: 'scan', color: 'bg-blue-500' },
    { title: 'Báo cáo sự cố', icon: AlertTriangle, action: 'report', color: 'bg-red-500' },
    { title: 'Kiểm tra vị trí', icon: MapPin, action: 'location', color: 'bg-green-500' },
    { title: 'Ghi chú', icon: FileText, action: 'note', color: 'bg-yellow-500' },
  ];

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Vận hành
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Xin chào <span className="font-semibold">{user?.name}</span>, bạn đang có {currentTasks.length} nhiệm vụ đang thực hiện
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Lịch sử
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Scan className="w-4 h-4" />
              Quét QR
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`${stat.color} p-2 rounded-lg`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <div className={`${action.color} p-3 rounded-lg`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300">
                    {action.title}
                  </span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Current Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Đang thực hiện
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        task.type === 'import' ? 'bg-green-500' : 'bg-blue-500'
                      }`}>
                        <Container className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {task.container}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {task.customer} • {task.size}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
                      {task.type === 'import' ? 'NHẬP' : 'XUẤT'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4" />
                      <span>{task.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>Bắt đầu: {task.startTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Package className="w-4 h-4" />
                      <span>{task.weight}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Hoàn thành
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Ghi chú
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks & Completed Today */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Nhiệm vụ chờ xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {task.container}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {task.customer} • {task.size}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {task.priority === 'high' ? 'Ưu tiên' : 'Bình thường'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Clock className="w-4 h-4" />
                      <span>Dự kiến: {task.scheduledTime}</span>
                    </div>
                    {task.notes && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        <AlertTriangle className="w-3 h-3 inline mr-1" />
                        {task.notes}
                      </p>
                    )}
                    <Button size="sm" variant="outline" className="w-full">
                      Bắt đầu nhiệm vụ
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completed Today */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Đã hoàn thành hôm nay
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedToday.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/10"
                  >
                    <div className="p-2 bg-green-500 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.container}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {item.customer}
                      </p>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      {item.time}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WarehouseLayout>
  );
}

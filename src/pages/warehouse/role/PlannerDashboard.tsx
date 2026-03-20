import { motion } from 'motion/react';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';
import { 
  Calendar, 
  Container,
  MapPin,
  Clock,
  TrendingUp,
  Package,
  Truck,
  AlertCircle,
  CheckCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';

export default function PlannerDashboard() {
  const { user } = useWarehouseAuth();

  const stats = [
    { 
      title: 'Lịch trình hôm nay', 
      value: '24', 
      icon: Calendar, 
      color: 'bg-blue-500'
    },
    { 
      title: 'Container chờ xử lý', 
      value: '156', 
      icon: Container, 
      color: 'bg-yellow-500'
    },
    { 
      title: 'Đã hoàn thành', 
      value: '342', 
      icon: CheckCircle, 
      color: 'bg-green-500'
    },
    { 
      title: 'Cảnh báo', 
      value: '5', 
      icon: AlertCircle, 
      color: 'bg-red-500'
    },
  ];

  const todaySchedules = [
    { 
      id: 1, 
      time: '08:00 - 10:00', 
      ship: 'MV Ocean Star', 
      type: 'import', 
      containers: 45, 
      status: 'in-progress',
      location: 'Bến số 3'
    },
    { 
      id: 2, 
      time: '10:30 - 12:00', 
      ship: 'MV Pacific Dream', 
      type: 'export', 
      containers: 38, 
      status: 'scheduled',
      location: 'Bến số 1'
    },
    { 
      id: 3, 
      time: '14:00 - 16:00', 
      ship: 'MV Sea Harmony', 
      type: 'import', 
      containers: 52, 
      status: 'scheduled',
      location: 'Bến số 2'
    },
    { 
      id: 4, 
      time: '16:30 - 18:00', 
      ship: 'MV Blue Wave', 
      type: 'export', 
      containers: 29, 
      status: 'scheduled',
      location: 'Bến số 4'
    },
  ];

  const warehouseStatus = [
    { area: 'Khu A', capacity: 85, available: 15, containers: 340 },
    { area: 'Khu B', capacity: 92, available: 8, containers: 368 },
    { area: 'Khu C', capacity: 67, available: 33, containers: 268 },
    { area: 'Khu D', capacity: 78, available: 22, containers: 312 },
  ];

  const pendingTasks = [
    { id: 1, task: 'Lập kế hoạch xuất container cho MV Pacific Dream', priority: 'high', deadline: '14:00 hôm nay' },
    { id: 2, task: 'Xác nhận lịch nhập hàng cho khách hàng ABC', priority: 'medium', deadline: '17:00 hôm nay' },
    { id: 3, task: 'Tối ưu hóa vị trí container khu B', priority: 'low', deadline: 'Mai' },
    { id: 4, task: 'Chuẩn bị báo cáo tuần', priority: 'medium', deadline: 'Thứ 6' },
  ];

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Kế hoạch
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Chào <span className="font-semibold">{user?.name}</span>, hôm nay có {todaySchedules.length} lịch trình cần theo dõi
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <FileText className="w-4 h-4" />
              Báo cáo
            </Button>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Calendar className="w-4 h-4" />
              Tạo lịch trình
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

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Lịch trình hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todaySchedules.map((schedule, index) => (
                <motion.div
                  key={schedule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-3 rounded-lg ${
                      schedule.type === 'import' ? 'bg-green-500' : 'bg-blue-500'
                    }`}>
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {schedule.ship}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          schedule.status === 'in-progress' 
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {schedule.status === 'in-progress' ? 'Đang thực hiện' : 'Đã lên lịch'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {schedule.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {schedule.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {schedule.containers} containers
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Chi tiết
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Status & Pending Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Warehouse Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Tình trạng kho bãi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {warehouseStatus.map((area, index) => (
                  <motion.div
                    key={area.area}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {area.area}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {area.containers} containers
                      </span>
                    </div>
                    <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${area.capacity}%` }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                        className={`absolute left-0 top-0 h-full rounded-full ${
                          area.capacity > 85 ? 'bg-red-500' :
                          area.capacity > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Công suất: {area.capacity}%</span>
                      <span>Còn trống: {area.available}%</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Công việc cần xử lý
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {task.task}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Hạn: {task.deadline}
                        </span>
                      </div>
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

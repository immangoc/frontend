import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Calendar,
  FileText,
  DollarSign,
} from 'lucide-react';
import HungThuyLogo from './HungThuyLogo';
import { useWarehouseAuth } from '../../contexts/WarehouseAuthContext';

interface WarehouseLayoutProps {
  children: ReactNode;
}

export default function WarehouseLayout({ children }: WarehouseLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useWarehouseAuth();

  // Get user role and name from context
  const userRole = user?.role || 'customer';
  const userName = user?.name || 'User';

  // Navigation items based on role
  const getNavigationItems = () => {
    const roleBasedDashboards = {
      admin: { name: 'Dashboard', path: '/warehouse/admin/dashboard', icon: LayoutDashboard },
      planner: { name: 'Dashboard', path: '/warehouse/planner/dashboard', icon: LayoutDashboard },
      operator: { name: 'Dashboard', path: '/warehouse/operator/dashboard', icon: LayoutDashboard },
      customer: { name: 'Dashboard', path: '/warehouse/customer/dashboard', icon: LayoutDashboard },
    };

    const allItems = [
      // Dashboard - role specific
      roleBasedDashboards[userRole as keyof typeof roleBasedDashboards],
      
      // Admin items
      { name: 'Quản lý Container', path: '/warehouse/containers', icon: Package, roles: ['admin', 'planner', 'operator'] },
      { name: 'Quản lý Người dùng', path: '/warehouse/users', icon: Users, roles: ['admin'] },
      { name: 'Báo cáo & Thống kê', path: '/warehouse/reports', icon: BarChart3, roles: ['admin', 'planner'] },
      { name: 'Cài đặt Kho bãi', path: '/warehouse/config', icon: Warehouse, roles: ['admin'] },
      { name: 'Cài đặt', path: '/warehouse/settings', icon: Settings, roles: ['admin'] },
      
      // Planner items
      { name: 'Lập lịch trình', path: '/warehouse/schedule', icon: Calendar, roles: ['planner'] },
      
      // Customer items
      { name: 'Container của tôi', path: '/warehouse/my-containers', icon: Package, roles: ['customer'] },
      { name: 'Đơn hàng', path: '/warehouse/orders', icon: FileText, roles: ['customer'] },
      { name: 'Thanh toán', path: '/warehouse/payments', icon: DollarSign, roles: ['customer'] },
    ];

    return allItems.filter(item => {
      if (!item) return false;
      if (!item.roles) return true; // Dashboard items don't have roles
      return item.roles.includes(userRole);
    });
  };

  const navigationItems = getNavigationItems();

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { text: 'Quản trị viên', color: 'bg-red-500' },
      planner: { text: 'Kế hoạch', color: 'bg-blue-500' },
      operator: { text: 'Vận hành', color: 'bg-green-500' },
      customer: { text: 'Khách hàng', color: 'bg-purple-500' },
    };
    return badges[role as keyof typeof badges] || badges.customer;
  };

  const roleBadge = getRoleBadge(userRole);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-40 overflow-y-auto shadow-xl"
          >
            {/* Logo with Close Button */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <HungThuyLogo size="md" showText={true} />
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center text-white font-bold shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    {userName}
                  </div>
                  <div className={`text-xs text-white ${roleBadge.color} px-2 py-0.5 rounded-full inline-block mt-1`}>
                    {roleBadge.text}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                <span className="font-medium">Đăng xuất</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">
                Hệ thống Quản lý Kho bãi Container
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm container..."
                  className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 w-64 text-sm"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Quick Action Button */}
              {userRole === 'admin' && (
                <Link to="/warehouse/containers">
                  <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm font-medium">
                    <Package size={16} />
                    Quản lý Container
                  </button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
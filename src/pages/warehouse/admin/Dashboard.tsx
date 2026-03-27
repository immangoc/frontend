import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const statCards = [
  { title: 'Tổng đơn hàng', value: '10', subtitle: '4 đơn chờ xử lý', color: 'si-blue' },
  { title: 'Container trong kho', value: '4', subtitle: '10 tổng cộng', color: 'si-green' },
  { title: 'Doanh thu năm nay', value: '₫3K', subtitle: '2 hóa đơn', color: 'si-purple' },
  { title: 'Cảnh báo mở', value: '7', subtitle: 'Cần xử lý', color: 'si-red' },
];

const revenueData = [
  { name: 'T1', value: 48 }, { name: 'T2', value: 52 }, { name: 'T3', value: 45 }, { name: 'T4', value: 61 },
  { name: 'T5', value: 55 }, { name: 'T6', value: 70 }, { name: 'T7', value: 73 }, { name: 'T8', value: 78 },
  { name: 'T9', value: 82 }, { name: 'T10', value: 85 }, { name: 'T11', value: 95 }, { name: 'T12', value: 100 },
];

const ordersData = [
  { name: 'T1', value: 320 }, { name: 'T2', value: 380 }, { name: 'T3', value: 340 }, { name: 'T4', value: 430 },
  { name: 'T5', value: 400 }, { name: 'T6', value: 460 }, { name: 'T7', value: 450 }, { name: 'T8', value: 520 },
  { name: 'T9', value: 540 }, { name: 'T10', value: 570 }, { name: 'T11', value: 610 }, { name: 'T12', value: 650 },
];

const topContainers = [
  { loai: '20ft Khô', soLuong: 5, doanhThu: '₫85M', badge: 'badge-info' },
  { loai: '40ft Lạnh', soLuong: 3, doanhThu: '₫120M', badge: 'badge-success' },
  { loai: '20ft Nguy Hiểm', soLuong: 1, doanhThu: '₫45M', badge: 'badge-warning' },
  { loai: '40ft Dễ Vỡ', soLuong: 1, doanhThu: '₫32M', badge: 'badge-gray' },
];

const recentOrders = [
  { ma: 'ORD-10', khach: 'Hàng Hải Bình Minh', trangThai: 'Chờ duyệt', badge: 'badge-warning' },
  { ma: 'ORD-9', khach: 'Cảng Sài Gòn', trangThai: 'Đã duyệt', badge: 'badge-info' },
  { ma: 'ORD-8', khach: 'Thái Bình Dương', trangThai: 'Chờ duyệt', badge: 'badge-warning' },
  { ma: 'ORD-7', khach: 'Đại Dương Xanh', trangThai: 'Đã duyệt', badge: 'badge-info' },
  { ma: 'ORD-6', khach: 'Thương Mại SG', trangThai: 'Từ chối', badge: 'badge-danger' },
];

export default function Dashboard() {
  return (
    <>
      <div className="page-title">Dashboard</div>
      <div className="page-subtitle">Chào mừng trở lại! Đây là tổng quan hệ thống của bạn.</div>

      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.title}>
            <div>
              <div className="stat-label">{card.title}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-sub">{card.subtitle}</div>
            </div>
            <div className={`stat-icon ${card.color}`}>
              <span style={{ fontSize: 20 }}>•</span>
            </div>
          </div>
        ))}
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Doanh thu theo tháng</div>
              <div className="card-subtitle">Biểu đồ doanh thu 12 tháng gần nhất</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c47ff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6c47ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#6c47ff" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Đơn hàng theo tháng</div>
              <div className="card-subtitle">Số lượng đơn hàng 12 tháng gần nhất</div>
            </div>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Bar dataKey="value" fill="#6c47ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Loại Container phổ biến</div>
              <div className="card-subtitle">Container được lưu nhiều nhất & doanh thu</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Loại</th><th>Số lượng</th><th>Doanh thu</th></tr>
              </thead>
              <tbody>
                {topContainers.map((row) => (
                  <tr key={row.loai}>
                    <td><span className={`badge ${row.badge}`}>{row.loai}</span></td>
                    <td>{row.soLuong}</td>
                    <td>{row.doanhThu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Đơn hàng gần đây</div>
              <div className="card-subtitle">5 đơn hàng mới nhất</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Mã đơn</th><th>Khách hàng</th><th>Trạng thái</th></tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.ma}>
                    <td>{order.ma}</td>
                    <td>{order.khach}</td>
                    <td><span className={`badge ${order.badge}`}>{order.trangThai}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

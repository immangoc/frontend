import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Pie, PieChart, Cell } from 'recharts';
import PageHeader from '../../../components/warehouse/PageHeader';

const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const revenueData = months.map((name, index) => ({ name, value: [48,52,45,61,55,70,73,78,82,85,95,100][index] }));
const orderData = months.map((name, index) => ({ name, value: [320,380,340,430,400,460,450,520,540,570,610,650][index] }));
const pieData = [
  { name: 'Hàng Khô', value: 50, color: '#10b981' },
  { name: 'Hàng Lạnh', value: 30, color: '#06b6d4' },
  { name: 'Hàng Nguy Hiểm', value: 10, color: '#a855f7' },
  { name: 'Hàng Dễ Vỡ', value: 10, color: '#3b82f6' },
];
const damageRows = [
  { don: 'ORD-3', loai: 'Hàng Dễ Vỡ', moTa: 'Vỡ 3 kiện hàng thủy tinh', ngay: '05/01/2026', phi: '₫4.5M', trangThai: 'Chờ xử lý', badge: 'badge-danger' },
  { don: 'ORD-5', loai: 'Hàng Lạnh', moTa: 'Hỏng máy làm lạnh, hàng bị tan', ngay: '12/01/2026', phi: '₫8M', trangThai: 'Đang giải quyết', badge: 'badge-warning' },
  { don: 'ORD-7', loai: 'Hàng Khô', moTa: 'Bao bì bị rách ướt do dột mái', ngay: '18/01/2026', phi: '₫2.1M', trangThai: 'Đã giải quyết', badge: 'badge-success' },
  { don: 'ORD-2', loai: 'Hàng Nguy Hiểm', moTa: 'Thùng hóa chất bị rỉ nhẹ', ngay: '22/02/2026', phi: '₫3.4M', trangThai: 'Chờ xử lý', badge: 'badge-danger' },
  { don: 'ORD-9', loai: 'Hàng Dễ Vỡ', moTa: 'Hỏng 2 màn hình LCD', ngay: '28/02/2026', phi: '₫0M', trangThai: 'Miễn phí', badge: 'badge-success' },
];

const REPORT_TABS = [
  { id: 'tongquan', label: 'Tổng quan' },
  { id: 'hanghong', label: 'Tổng hợp hàng hỏng' },
  { id: 'kho-lanh', label: 'Tổng hợp kho lạnh' },
  { id: 'kho-kho', label: 'Tổng hợp kho khô' },
  { id: 'kho-de-vo', label: 'Tổng hợp kho dễ vỡ' },
  { id: 'kho-khac', label: 'Tổng hợp kho khác' },
] as const;

type ReportTabKey = (typeof REPORT_TABS)[number]['id'];

const reportData: Record<Exclude<ReportTabKey, 'tongquan'>, { title: string; subtitle: string; rows: typeof damageRows }> = {
  hanghong: {
    title: 'Tổng hợp hàng hỏng',
    subtitle: 'Phân loại các hàng hỏng theo đơn hàng',
    rows: damageRows,
  },
  'kho-lanh': {
    title: 'Tổng hợp kho lạnh',
    subtitle: 'Tổng hợp hiệu suất và sự cố của kho lạnh',
    rows: [
      { don: 'KLT-01', loai: 'Kho lạnh', moTa: 'Nhiệt độ ổn định 2°C', ngay: '01/03/2026', phi: '₫12M', trangThai: 'Bình thường', badge: 'badge-success' },
      { don: 'KLT-02', loai: 'Kho lạnh', moTa: 'Đã ghi nhận rò rỉ ẩm', ngay: '09/03/2026', phi: '₫4M', trangThai: 'Đang xử lý', badge: 'badge-warning' },
      { don: 'KLT-03', loai: 'Kho lạnh', moTa: 'Thiết bị lạnh cần bảo trì', ngay: '15/03/2026', phi: '₫6M', trangThai: 'Chờ xử lý', badge: 'badge-warning' },
    ],
  },
  'kho-kho': {
    title: 'Tổng hợp kho khô',
    subtitle: 'Tổng hợp hiệu suất và sự cố của kho khô',
    rows: [
      { don: 'KHK-01', loai: 'Kho khô', moTa: 'Lưu kho hàng khô an toàn', ngay: '02/03/2026', phi: '₫8M', trangThai: 'Bình thường', badge: 'badge-success' },
      { don: 'KHK-02', loai: 'Kho khô', moTa: 'Phát hiện ẩm thấp vùng góc', ngay: '08/03/2026', phi: '₫3.5M', trangThai: 'Đang xử lý', badge: 'badge-warning' },
      { don: 'KHK-03', loai: 'Kho khô', moTa: 'Cần điều chỉnh độ thông gió', ngay: '20/03/2026', phi: '₫2.4M', trangThai: 'Chờ xử lý', badge: 'badge-warning' },
    ],
  },
  'kho-de-vo': {
    title: 'Tổng hợp kho dễ vỡ',
    subtitle: 'Tổng hợp quản lý hàng dễ vỡ và rủi ro',
    rows: [
      { don: 'KDV-01', loai: 'Kho dễ vỡ', moTa: 'Đóng gói bổ sung cho hàng thủy tinh', ngay: '04/03/2026', phi: '₫9M', trangThai: 'Bình thường', badge: 'badge-success' },
      { don: 'KDV-02', loai: 'Kho dễ vỡ', moTa: 'Hỏng 1 kiện do va chạm', ngay: '14/03/2026', phi: '₫5.5M', trangThai: 'Đang xử lý', badge: 'badge-warning' },
      { don: 'KDV-03', loai: 'Kho dễ vỡ', moTa: 'Tăng cường đệm lót', ngay: '18/03/2026', phi: '₫3.2M', trangThai: 'Bình thường', badge: 'badge-success' },
    ],
  },
  'kho-khac': {
    title: 'Tổng hợp kho khác',
    subtitle: 'Tổng hợp các kho đặc thù và dịch vụ kèm theo',
    rows: [
      { don: 'KHKC-01', loai: 'Kho khác', moTa: 'Bảo quản hàng nông sản', ngay: '06/03/2026', phi: '₫7M', trangThai: 'Bình thường', badge: 'badge-success' },
      { don: 'KHKC-02', loai: 'Kho khác', moTa: 'Tiếp nhận lô hàng bao bì đặc biệt', ngay: '12/03/2026', phi: '₫4.8M', trangThai: 'Hoàn thành', badge: 'badge-success' },
      { don: 'KHKC-03', loai: 'Kho khác', moTa: 'Cần kiểm tra an toàn PCCC', ngay: '19/03/2026', phi: '₫3M', trangThai: 'Đang xử lý', badge: 'badge-warning' },
    ],
  },
};

function parseMoney(value: string) {
  const normalized = value.replace(/[₫,]/g, '').replace(/M/g, '000000').replace(/K/g, '000');
  const digits = normalized.match(/[0-9]+/g);
  return digits ? Number(digits.join('')) : 0;
}

export default function BaoCaoThongKe() {
  const [tab, setTab] = useState<ReportTabKey>('tongquan');
  const [filterHang, setFilterHang] = useState('all');

  const activeReport = tab === 'tongquan' ? undefined : reportData[tab as Exclude<ReportTabKey, 'tongquan'>];

  const filteredRows = useMemo(() => {
    if (filterHang === 'all') return damageRows;
    return damageRows.filter((row) => row.loai.includes(filterHang));
  }, [filterHang]);

  return (
    <>
      <PageHeader
        title="Báo cáo & Thống kê"
        subtitle="Phân tích dữ liệu theo thời gian thực"
        action={null}
      />

      <div className="tabs">
        {REPORT_TABS.map((item) => (
          <button key={item.id} className={`tab-btn${tab === item.id ? ' active' : ''}`} type="button" onClick={() => setTab(item.id)}>{item.label}</button>
        ))}
      </div>

      {tab === 'tongquan' ? (
        <>
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', marginBottom: 16 }}>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Doanh thu (sau khấu trừ)</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>₫282M</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Trừ phạt ₫18M | Xuất chậm ₫5M</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Chi phí ước tính</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>₫145M</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Vận hành + bảo trì + nhân sự</div>
            </div>
            <div className="card">
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>Lợi nhuận ròng</div>
              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>₫137M</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 6 }}>Biên lợi nhuận 48.6%</div>
            </div>
          </div>

          <div className="charts-grid" style={{ marginBottom: 16 }}>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Hoạt động Gate theo tháng</div>
                  <div className="card-subtitle">Gate vào / Gate ra / Gate hỏng</div>
                </div>
              </div>
              <div style={{ width: '100%', height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Phân bổ container theo loại hàng</div>
                  <div className="card-subtitle">Số lượng container theo loại</div>
                </div>
              </div>
              <div className="two-col" style={{ gap: 14, alignItems: 'center' }}>
                <div style={{ width: '100%', height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90} paddingAngle={4}>
                        {pieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ minWidth: 180 }}>
                  {pieData.map((entry) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13 }}>
                      <span className="legend-dot" style={{ background: entry.color }} />
                      <span>{entry.name}: {entry.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Khách hàng hàng đầu</div>
                <div className="card-subtitle">Top 5 khách hàng doanh thu cao nhất</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pieData.map((item) => ({ name: item.name, value: item.value * 2 }))} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6c47ff" radius={[6, 6, 6, 6]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Bảng xếp hạng</div>
                {['Trần Văn B', 'Lê Thị C', 'Phạm Văn D', 'Hoàng Thị E', 'Ngô Văn F'].map((name, idx) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700 }}>{idx + 1}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{45 - idx * 5} đơn hàng</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₫{125 - idx * 15}M</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header" style={{ justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div className="card-title">{activeReport?.title}</div>
                <div className="card-subtitle">{activeReport?.subtitle}</div>
              </div>
            </div>
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: 16 }}>
              <div className="stat-card"><div><div className="stat-label">Tổng mục</div><div className="stat-value">{activeReport?.rows.length}</div></div></div>
              <div className="stat-card"><div><div className="stat-label">Tổng phí</div><div className="stat-value" style={{ fontSize: 18 }}>{(() => {
                const total = activeReport?.rows.reduce((sum, row) => sum + parseMoney(row.phi), 0) ?? 0;
                return total >= 1000000 ? `₫${Math.round(total / 1000000)}M` : `₫${(total / 1000).toLocaleString()}K`;
              })()}</div></div></div>
              <div className="stat-card"><div><div className="stat-label">Đơn hàng</div><div className="stat-value">{activeReport?.rows.length}</div></div></div>
              <div className="stat-card"><div><div className="stat-label">Tỷ lệ sự cố</div><div className="stat-value">{Math.min(15 + (activeReport?.rows.length ?? 0), 28)}%</div></div></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th><th>Loại</th><th>Mô tả</th><th>Ngày</th><th>Chi phí</th><th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {activeReport?.rows.map((row) => (
                    <tr key={row.don}>
                      <td>{row.don}</td>
                      <td><span className={`badge ${row.badge}`}>{row.loai}</span></td>
                      <td>{row.moTa}</td>
                      <td>{row.ngay}</td>
                      <td>{row.phi}</td>
                      <td><span className={`badge ${row.badge}`}>{row.trangThai}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

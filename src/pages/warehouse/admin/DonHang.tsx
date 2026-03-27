import { useMemo, useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';

const ORDER_DATA = [
  { ma: 'ORD-10', kh: 'TNHH Hàng Hải Bình Minh', ngay: '15/02/2026', containers: 0, tong: '—', tt: 'Chờ duyệt', badge: 'badge-warning' },
  { ma: 'ORD-9', kh: 'TCT Cảng Sài Gòn', ngay: '10/02/2026', containers: 1, tong: '₫25M', tt: 'Đã duyệt', badge: 'badge-info' },
  { ma: 'ORD-8', kh: 'TNHH Thái Bình Dương', ngay: '08/02/2026', containers: 0, tong: '—', tt: 'Chờ duyệt', badge: 'badge-warning' },
  { ma: 'ORD-4', kh: 'Đại Dương Xanh', ngay: '03/02/2026', containers: 1, tong: '₫18M', tt: 'Chờ duyệt', badge: 'badge-warning' },
  { ma: 'ORD-3', kh: 'XNK Hải Nam', ngay: '01/02/2026', containers: 1, tong: '₫32M', tt: 'Hoạt động', badge: 'badge-success' },
  { ma: 'ORD-5', kh: 'Vận Tải Mê Kông', ngay: '30/01/2026', containers: 0, tong: '—', tt: 'Đã duyệt', badge: 'badge-info' },
  { ma: 'ORD-6', kh: 'Thương Mại SG', ngay: '18/01/2026', containers: 0, tong: '—', tt: 'Từ chối', badge: 'badge-danger' },
  { ma: 'ORD-2', kh: 'CP Logistics VN', ngay: '26/01/2026', containers: 1, tong: '₫38M', tt: 'Đã duyệt', badge: 'badge-info' },
  { ma: 'ORD-1', kh: 'Thương Mại Phú Quý', ngay: '25/01/2026', containers: 1, tong: '₫55M', tt: 'Đã duyệt', badge: 'badge-info' },
  { ma: 'ORD-7', kh: 'Hàng Hải Đồng Nam Á', ngay: '20/01/2026', containers: 0, tong: '—', tt: 'Hủy', badge: 'badge-danger' },
];

export default function DonHang() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => ORDER_DATA.filter((order) => {
    const query = search.toLowerCase();
    const matchSearch = order.ma.toLowerCase().includes(query) || order.kh.toLowerCase().includes(query);
    const matchStatus = status === 'all' || order.tt === status;
    return matchSearch && matchStatus;
  }), [search, status]);

  return (
    <>
      <PageHeader
        title="Quản lý đơn hàng"
        subtitle="Theo dõi và quản lý tất cả đơn hàng"
        action={<button type="button" className="btn btn-primary">+ Tạo đơn hàng</button>}
      />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', marginBottom: 16 }}>
        <div className="stat-card"><div><div className="stat-label">Tổng đơn hàng</div><div className="stat-value">10</div><div className="stat-sub">4 đang xử lý</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Đang xử lý</div><div className="stat-value">4</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Đã duyệt</div><div className="stat-value">4</div></div></div>
        <div className="stat-card"><div><div className="stat-label">Đã hủy</div><div className="stat-value">2</div></div></div>
      </div>

      <div className="card">
        <div className="search-bar" style={{ flexWrap: 'wrap', gap: 12 }}>
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-input"
              placeholder="Tìm kiếm mã đơn, khách hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">Tất cả</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Từ chối">Từ chối</option>
            <option value="Hủy">Hủy</option>
          </select>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th><th>Khách hàng</th><th>Ngày đặt</th><th>Số container</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.ma}>
                  <td>{order.ma}</td>
                  <td>{order.kh}</td>
                  <td>{order.ngay}</td>
                  <td>{order.containers}</td>
                  <td>{order.tong}</td>
                  <td><span className={`badge ${order.badge}`}>{order.tt}</span></td>
                  <td><button type="button" className="btn btn-secondary btn-sm">✏ Xem</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

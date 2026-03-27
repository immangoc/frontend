import { useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';

const ROLES = ['Admin', 'Điều phối', 'Nhân viên kho', 'Khách hàng'];
const INIT_USERS = [
  { name: 'Admin Hệ thống', email: 'admin@warehouse.vn', role: 'Admin', tt: 'Hoạt động', initials: 'AD', color: 'var(--primary)' },
  { name: 'Nguyễn Điều Phối', email: 'dieuphoi@warehouse.vn', role: 'Điều phối', tt: 'Hoạt động', initials: 'DP', color: 'var(--info)' },
  { name: 'Trần Nhân Viên', email: 'nhanvien.kho@warehouse.vn', role: 'Nhân viên kho', tt: 'Hoạt động', initials: 'NK', color: 'var(--success)' },
  { name: 'Công ty CP Logistics', email: 'logistics.vn@example.com', role: 'Khách hàng', tt: 'Hoạt động', initials: 'KH', color: '#888' },
  { name: 'TCT Cảng Sài Gòn', email: 'cangsg@example.com', role: 'Khách hàng', tt: 'Chờ xác minh', initials: 'KH', color: '#888' },
];
const TT_BADGE: Record<string, string> = { 'Hoạt động': 'badge-success', 'Chờ xác minh': 'badge-warning', 'Bị khóa': 'badge-danger' };

export default function QuanTriHeThong() {
  const [users, setUsers] = useState(INIT_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tất cả vai trò');
  const [open, setOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<typeof INIT_USERS[number] | null>(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Khách hàng', pass: '' });

  const filteredUsers = users.filter((user) => {
    const query = search.toLowerCase();
    return (
      (user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)) &&
      (roleFilter === 'Tất cả vai trò' || user.role === roleFilter)
    );
  });

  const handleAdd = () => {
    if (!newUser.name || !newUser.email) {
      alert('Vui lòng nhập đầy đủ!');
      return;
    }
    setUsers((prev) => [...prev, { ...newUser, tt: 'Hoạt động', initials: newUser.name.slice(0, 2).toUpperCase(), color: '#888' }]);
    setNewUser({ name: '', email: '', role: 'Khách hàng', pass: '' });
    setOpen(false);
  };

  const setNewValue = (key: keyof typeof newUser, value: string) => setNewUser((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <PageHeader title="Quản trị hệ thống" subtitle="Danh sách tất cả người dùng trong hệ thống" action={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>+ Thêm người dùng</button>} />

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="search-bar" style={{ justifyContent: 'space-between', gap: 12 }}>
          <div className="search-wrap">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input className="search-input" placeholder="Tìm theo tên, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option>Tất cả vai trò</option>
            {ROLES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Tên người dùng</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar" style={{ width: 28, height: 28, fontSize: 11, background: user.color }}>{user.initials}</div>
                      {user.name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <select className="filter-select" style={{ padding: '4px 8px', fontSize: 12 }} value={user.role} onChange={(e) => setUsers((prev) => prev.map((u, idx) => idx === index ? { ...u, role: e.target.value } : u))}>
                      {ROLES.map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </td>
                  <td><span className={`badge ${TT_BADGE[user.tt] || 'badge-gray'}`}>{user.tt}</span></td>
                  <td>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setDetailUser(user)}>👁 Xem</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`modal-overlay${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Thêm người dùng</div>
            <button type="button" className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="form-group">
            <label className="form-label">Họ và tên</label>
            <input className="form-input" placeholder="Nguyễn Văn A" value={newUser.name} onChange={(e) => setNewValue('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="email@example.com" value={newUser.email} onChange={(e) => setNewValue('email', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Vai trò</label>
            <select className="form-input" value={newUser.role} onChange={(e) => setNewValue('role', e.target.value)}>
              {ROLES.map((role) => <option key={role}>{role}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu tạm</label>
            <input className="form-input" type="password" placeholder="Mật khẩu ban đầu" value={newUser.pass} onChange={(e) => setNewValue('pass', e.target.value)} />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Hủy</button>
            <button type="button" className="btn btn-primary" onClick={handleAdd}>Thêm người dùng</button>
          </div>
        </div>
      </div>

      {detailUser && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setDetailUser(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">Chi tiết người dùng</div>
              <button type="button" className="modal-close" onClick={() => setDetailUser(null)}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16 }}>
              <div className="avatar" style={{ width: 52, height: 52, fontSize: 18, background: detailUser.color }}>{detailUser.initials}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{detailUser.name}</div>
                <div style={{ color: 'var(--text2)', fontSize: 13 }}>{detailUser.email}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              <div><div style={{ color: 'var(--text2)' }}>Vai trò</div><div style={{ fontWeight: 500 }}>{detailUser.role}</div></div>
              <div><div style={{ color: 'var(--text2)' }}>Trạng thái</div><span className={`badge ${TT_BADGE[detailUser.tt] || 'badge-gray'}`}>{detailUser.tt}</span></div>
              <div><div style={{ color: 'var(--text2)' }}>Ngày tham gia</div><div style={{ fontWeight: 500 }}>10/01/2026</div></div>
              <div><div style={{ color: 'var(--text2)' }}>Số đơn hàng</div><div style={{ fontWeight: 500 }}>3 đơn</div></div>
            </div>
            <div className="form-actions" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setDetailUser(null)}>Đóng</button>
              <button type="button" className="btn btn-danger btn-sm">Vô hiệu hóa</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

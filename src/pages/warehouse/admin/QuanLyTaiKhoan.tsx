import { useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';
import { useWarehouseAuth } from '../../../contexts/WarehouseAuthContext';

interface QuanLyTaiKhoanProps {
  title?: string;
  subtitle?: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  planner: 'Điều phối',
  operator: 'Nhân viên kho',
  customer: 'Khách hàng',
};

export default function QuanLyTaiKhoan({ title, subtitle }: QuanLyTaiKhoanProps) {
  const { user } = useWarehouseAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newOrderNotif, setNewOrderNotif] = useState(true);
  const [stockAlertNotif, setStockAlertNotif] = useState(true);
  const [weeklyReportNotif, setWeeklyReportNotif] = useState(false);
  const [marketingEmailNotif, setMarketingEmailNotif] = useState(false);
  const [language, setLanguage] = useState('Tiếng Việt');
  const [theme, setTheme] = useState('Sáng');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('VND (₫)');

  const initials = user?.name?.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'AD';
  const roleLabel = user ? ROLE_LABELS[user.role] ?? 'Quản trị viên' : 'Quản trị viên';

  const handleSaveProfile = () => {
    alert('Thông tin cá nhân đã được cập nhật (demo).');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    alert('Mật khẩu đã được thay đổi (demo).');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const pageTitle = title || 'Tài khoản Admin';
  const pageSubtitle = subtitle || 'Quản lý thông tin cá nhân và đổi mật khẩu';

  return (
    <>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      <div className="two-col" style={{ marginBottom: 20, gap: 20 }}>
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div>
              <div className="profile-name">{user?.name || 'Quản trị viên'}</div>
              <div className="profile-role">{roleLabel}</div>
            </div>
          </div>
          <div className="profile-summary">
            <div className="profile-summary-item">
              Email
              <span>{email || 'admin@warehouse.vn'}</span>
            </div>
            <div className="profile-summary-item">
              Số điện thoại
              <span>{phone || 'Chưa cập nhật'}</span>
            </div>
            <div className="profile-summary-item">
              Công ty
              <span>{company || 'Chưa cập nhật'}</span>
            </div>
            <div className="profile-summary-item">
              Trạng thái
              <span>Hoạt động</span>
            </div>
          </div>
          <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
            <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>Cập nhật hồ sơ</button>
            <button type="button" className="btn btn-secondary">Sao chép ID</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Cập nhật hồ sơ</div>
              <div className="card-subtitle">Thay đổi thông tin cá nhân của bạn</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên đầy đủ" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Công ty</label>
              <input className="form-input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Công ty / Doanh nghiệp" />
            </div>
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0909 123 456" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleSaveProfile}>Lưu thông tin</button>
          </div>
        </div>
      </div>

      <div className="two-col" style={{ gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Đổi mật khẩu</div>
              <div className="card-subtitle">Bảo mật tài khoản bằng mật khẩu mới</div>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Mật khẩu hiện tại</label>
              <input className="form-input" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input className="form-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu</label>
              <input className="form-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-primary" onClick={handleChangePassword}>Đổi mật khẩu</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Thông tin tài khoản</div>
              <div className="card-subtitle">Các thiết lập liên quan đến tài khoản của bạn</div>
            </div>
          </div>
          <div className="profile-info">
            <div className="profile-summary-item">
              Vai trò
              <span>{roleLabel}</span>
            </div>
            <div className="profile-summary-item">
              Loại tài khoản
              <span>Admin</span>
            </div>
            <div className="profile-summary-item">
              Mã người dùng
              <span>{user?.id || 'N/A'}</span>
            </div>
            <div className="profile-summary-item">
              Lần đăng nhập cuối
              <span>Hôm nay</span>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col" style={{ gap: 20, marginTop: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Thông báo</div>
              <div className="card-subtitle">Quản lý loại thông báo bạn nhận được</div>
            </div>
          </div>
          <div className="setting-card">
            <label className="setting-item">
              <div>
                <div className="setting-title">Đơn hàng mới</div>
                <div className="setting-desc">Nhận thông báo khi có đơn hàng mới</div>
              </div>
              <button type="button" className={`toggle-switch${newOrderNotif ? ' active' : ''}`} onClick={() => setNewOrderNotif((prev: boolean) => !prev)} aria-pressed={newOrderNotif}>
                <span />
              </button>
            </label>
            <label className="setting-item">
              <div>
                <div className="setting-title">Cảnh báo tồn kho</div>
                <div className="setting-desc">Nhận cảnh báo khi sản phẩm sắp hết hàng</div>
              </div>
              <button type="button" className={`toggle-switch${stockAlertNotif ? ' active' : ''}`} onClick={() => setStockAlertNotif((prev: boolean) => !prev)} aria-pressed={stockAlertNotif}>
                <span />
              </button>
            </label>
            <label className="setting-item">
              <div>
                <div className="setting-title">Báo cáo hàng tuần</div>
                <div className="setting-desc">Nhận báo cáo tổng hợp hàng tuần</div>
              </div>
              <button type="button" className={`toggle-switch${weeklyReportNotif ? ' active' : ''}`} onClick={() => setWeeklyReportNotif((prev: boolean) => !prev)} aria-pressed={weeklyReportNotif}>
                <span />
              </button>
            </label>
            <label className="setting-item">
              <div>
                <div className="setting-title">Email marketing</div>
                <div className="setting-desc">Nhận email về khuyến mãi và tin tức</div>
              </div>
              <button type="button" className={`toggle-switch${marketingEmailNotif ? ' active' : ''}`} onClick={() => setMarketingEmailNotif((prev: boolean) => !prev)} aria-pressed={marketingEmailNotif}>
                <span />
              </button>
            </label>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Tùy chọn hiển thị</div>
              <div className="card-subtitle">Bật/tắt giao diện và cài đặt hiển thị</div>
            </div>
          </div>
          <div className="setting-card">
            <div className="setting-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="setting-title">Ngôn ngữ</div>
                <div className="setting-desc">Chọn ngôn ngữ giao diện</div>
              </div>
              <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>Tiếng Việt</option>
                <option>English</option>
              </select>
            </div>
            <div className="setting-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="setting-title">Giao diện</div>
                <div className="setting-desc">Chọn chế độ sáng hoặc tối</div>
              </div>
              <select className="form-input" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option>Sáng</option>
                <option>Tối</option>
              </select>
            </div>
            <div className="setting-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="setting-title">Định dạng ngày</div>
                <div className="setting-desc">Chọn tiêu chuẩn hiển thị ngày</div>
              </div>
              <select className="form-input" value={dateFormat} onChange={(e) => setDateFormat(e.target.value)}>
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
              </select>
            </div>
            <div className="setting-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <div className="setting-title">Đơn vị tiền tệ</div>
                <div className="setting-desc">Chọn đơn vị tiền tệ hiển thị</div>
              </div>
              <select className="form-input" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option>VND (₫)</option>
                <option>USD ($)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

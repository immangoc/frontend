import { useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';

const HANG_TAU_LIST = [
  { ma: 'HT-001', ten: 'Maersk Line' },
  { ma: 'HT-002', ten: 'Mediterranean Shipping (MSC)' },
  { ma: 'HT-003', ten: 'COSCO Shipping' },
  { ma: 'HT-005', ten: 'Vietnam Ocean Shipping (VOSCO)' },
];

const INIT_DATA = [
  { ma: 'LT-2026-01', hangTau: 'Maersk Line', tuyen: 'TP.HCM → Singapore', ngayDi: '05/04/2026', ngayDen: '07/04/2026', tt: 'Sắp khởi hành', badge: 'badge-info' },
  { ma: 'LT-2026-02', hangTau: 'MSC', tuyen: 'Hải Phòng → Rotterdam', ngayDi: '10/04/2026', ngayDen: '25/04/2026', tt: 'Sắp khởi hành', badge: 'badge-info' },
  { ma: 'LT-2026-03', hangTau: 'COSCO Shipping', tuyen: 'TP.HCM → Thượng Hải', ngayDi: '15/04/2026', ngayDen: '18/04/2026', tt: 'Chờ xác nhận', badge: 'badge-warning' },
  { ma: 'LT-2026-04', hangTau: 'VOSCO', tuyen: 'TP.HCM → Đà Nẵng', ngayDi: '20/03/2026', ngayDen: '21/03/2026', tt: 'Hoàn thành', badge: 'badge-success' },
  { ma: 'LT-2026-05', hangTau: 'Maersk Line', tuyen: 'TP.HCM → Busan', ngayDi: '01/03/2026', ngayDen: '04/03/2026', tt: 'Hoàn thành', badge: 'badge-success' },
];

export default function QuanLyLich() {
  const [data, setData] = useState(INIT_DATA);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ma: '', hangTau: HANG_TAU_LIST[0].ten, tuyen: '', ngayDi: '', ngayDen: '' });

  const setField = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleAdd = () => {
    if (!form.ma || !form.tuyen || !form.ngayDi || !form.ngayDen) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setData((prev) => [...prev, { ...form, tt: 'Chờ xác nhận', badge: 'badge-warning' }]);
    setForm({ ma: '', hangTau: HANG_TAU_LIST[0].ten, tuyen: '', ngayDi: '', ngayDen: '' });
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Lịch trình tàu"
        subtitle="Quản lý lịch trình vận chuyển container"
        action={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>+ Thêm lịch trình</button>}
      />

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Mã lịch</th><th>Hãng tàu</th><th>Tuyến đường</th><th>Ngày khởi hành</th><th>Ngày đến dự kiến</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.ma}>
                  <td><code>{row.ma}</code></td>
                  <td>{row.hangTau}</td>
                  <td>{row.tuyen}</td>
                  <td>{row.ngayDi}</td>
                  <td>{row.ngayDen}</td>
                  <td><span className={`badge ${row.badge}`}>{row.tt}</span></td>
                  <td><button type="button" className="btn btn-secondary btn-sm">✏ Sửa</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`modal-overlay${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Thêm lịch trình</div>
            <button type="button" className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mã lịch trình</label>
              <input className="form-input" placeholder="VD: LT-2026-06" value={form.ma} onChange={(e) => setField('ma', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hãng tàu</label>
              <select className="form-input" value={form.hangTau} onChange={(e) => setField('hangTau', e.target.value)}>
                {HANG_TAU_LIST.map((item) => (<option key={item.ma} value={item.ten}>{item.ten}</option>))}
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Tuyến đường</label>
              <input className="form-input" placeholder="VD: TP.HCM → Singapore" value={form.tuyen} onChange={(e) => setField('tuyen', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày khởi hành</label>
              <input className="form-input" type="date" value={form.ngayDi} onChange={(e) => setField('ngayDi', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Ngày đến dự kiến</label>
              <input className="form-input" type="date" value={form.ngayDen} onChange={(e) => setField('ngayDen', e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Hủy</button>
            <button type="button" className="btn btn-primary" onClick={handleAdd}>Thêm lịch</button>
          </div>
        </div>
      </div>
    </>
  );
}

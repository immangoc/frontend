import { useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';

const INIT_DATA = [
  { ma: 'HT-001', ten: 'Maersk Line', quocGia: 'Đan Mạch', tuyen: 12, tt: 'Hoạt động' },
  { ma: 'HT-002', ten: 'Mediterranean Shipping (MSC)', quocGia: 'Thụy Sĩ', tuyen: 8, tt: 'Hoạt động' },
  { ma: 'HT-003', ten: 'COSCO Shipping', quocGia: 'Trung Quốc', tuyen: 10, tt: 'Hoạt động' },
  { ma: 'HT-004', ten: 'Evergreen Marine', quocGia: 'Đài Loan', tuyen: 6, tt: 'Tạm dừng' },
  { ma: 'HT-005', ten: 'Vietnam Ocean Shipping (VOSCO)', quocGia: 'Việt Nam', tuyen: 5, tt: 'Hoạt động' },
];

export default function QuanLyHangTau() {
  const [data, setData] = useState(INIT_DATA);
  const [open, setOpen] = useState(false);
  const [ma, setMa] = useState('');
  const [ten, setTen] = useState('');

  const handleAdd = () => {
    if (!ma || !ten) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setData((prev) => [...prev, { ma, ten, quocGia: '-', tuyen: 0, tt: 'Hoạt động' }]);
    setMa('');
    setTen('');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Quản lý hãng tàu"
        subtitle="Danh sách hãng tàu hợp tác"
        action={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>+ Thêm hãng tàu</button>}
      />

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Mã hãng</th><th>Tên hãng tàu</th><th>Quốc gia</th><th>Số tuyến</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.ma}>
                  <td><code>{row.ma}</code></td>
                  <td>{row.ten}</td>
                  <td>{row.quocGia}</td>
                  <td>{row.tuyen}</td>
                  <td><span className={`badge ${row.tt === 'Hoạt động' ? 'badge-success' : 'badge-warning'}`}>{row.tt}</span></td>
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
            <div className="modal-title">Thêm hãng tàu</div>
            <button type="button" className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mã hãng tàu</label>
              <input className="form-input" placeholder="VD: HT-006" value={ma} onChange={(e) => setMa(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tên hãng tàu</label>
              <input className="form-input" placeholder="VD: Yang Ming Marine" value={ten} onChange={(e) => setTen(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Hủy</button>
            <button type="button" className="btn btn-primary" onClick={handleAdd}>Thêm</button>
          </div>
        </div>
      </div>
    </>
  );
}

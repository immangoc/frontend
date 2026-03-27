import { useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';

const INIT_DATA = [
  { ma: 'CT-001', loai: 'Container Khô 20ft', kt: '20 feet', tai: 24, tt: 'Hoạt động' },
  { ma: 'CT-002', loai: 'Container Khô 40ft', kt: '40 feet', tai: 26, tt: 'Hoạt động' },
  { ma: 'CT-003', loai: 'Container Lạnh 20ft', kt: '20 feet', tai: 22, tt: 'Hoạt động' },
  { ma: 'CT-004', loai: 'Container Lạnh 40ft', kt: '40 feet', tai: 25, tt: 'Hoạt động' },
  { ma: 'CT-005', loai: 'Container Nguy Hiểm', kt: '20 feet', tai: 20, tt: 'Bảo trì' },
  { ma: 'CT-006', loai: 'Container Dễ Vỡ', kt: '40ft HC', tai: 18, tt: 'Hoạt động' },
];

export default function QuanLyLoaiContainer() {
  const [data, setData] = useState(INIT_DATA);
  const [open, setOpen] = useState(false);
  const [ma, setMa] = useState('');
  const [loai, setLoai] = useState('');

  const handleAdd = () => {
    if (!ma || !loai) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setData((prev) => [...prev, { ma, loai, kt: '-', tai: '-', tt: 'Hoạt động' }]);
    setMa('');
    setLoai('');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Quản lý loại Container"
        subtitle="Danh sách các loại container trong hệ thống"
        action={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>+ Thêm loại Container</button>}
      />

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Mã Container</th><th>Loại Container</th><th>Kích thước</th><th>Tải trọng (tấn)</th><th>Trạng thái</th><th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.ma}>
                  <td><code>{row.ma}</code></td>
                  <td>{row.loai}</td>
                  <td>{row.kt}</td>
                  <td>{row.tai}</td>
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
            <div className="modal-title">Thêm loại Container</div>
            <button type="button" className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mã Container</label>
              <input className="form-input" placeholder="VD: CT-007" value={ma} onChange={(e) => setMa(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Loại Container</label>
              <input className="form-input" placeholder="VD: Container Khô 20ft" value={loai} onChange={(e) => setLoai(e.target.value)} />
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

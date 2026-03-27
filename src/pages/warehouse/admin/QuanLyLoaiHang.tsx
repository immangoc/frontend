import { useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';

const INIT_DATA = [
  { id: 'LH-01', loai: 'Hàng Khô', moTa: 'Hàng hóa thông thường, không cần bảo quản đặc biệt', phi: '₫50K' },
  { id: 'LH-02', loai: 'Hàng Lạnh', moTa: 'Thực phẩm, dược phẩm cần bảo quản nhiệt độ thấp', phi: '₫120K' },
  { id: 'LH-03', loai: 'Hàng Dễ Vỡ', moTa: 'Thủy tinh, gốm sứ, thiết bị điện tử', phi: '₫80K' },
  { id: 'LH-04', loai: 'Hàng Nguy Hiểm', moTa: 'Hóa chất, chất dễ cháy nổ, yêu cầu giấy phép', phi: '₫200K' },
  { id: 'LH-05', loai: 'Hàng Hỏng', moTa: 'Hàng hóa bị hư hỏng trong quá trình vận chuyển', phi: '₫30K' },
];

export default function QuanLyLoaiHang() {
  const [data, setData] = useState(INIT_DATA);
  const [open, setOpen] = useState(false);
  const [id, setId] = useState('');
  const [loai, setLoai] = useState('');

  const handleAdd = () => {
    if (!id || !loai) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    setData((prev) => [...prev, { id, loai, moTa: '-', phi: '-' }]);
    setId('');
    setLoai('');
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Quản lý loại hàng"
        subtitle="Danh sách phân loại hàng hóa"
        action={<button type="button" className="btn btn-primary" onClick={() => setOpen(true)}>+ Thêm loại hàng</button>}
      />

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Loại hàng</th><th>Mô tả</th><th>Phí bảo quản/ngày</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id}>
                  <td><code>{row.id}</code></td>
                  <td>{row.loai}</td>
                  <td>{row.moTa}</td>
                  <td>{row.phi}</td>
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
            <div className="modal-title">Thêm loại hàng</div>
            <button type="button" className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">ID loại hàng</label>
              <input className="form-input" placeholder="VD: LH-06" value={id} onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Loại hàng</label>
              <input className="form-input" placeholder="VD: Hàng Thực Phẩm Tươi" value={loai} onChange={(e) => setLoai(e.target.value)} />
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

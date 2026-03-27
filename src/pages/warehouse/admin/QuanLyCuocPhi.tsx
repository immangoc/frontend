import { useState } from 'react';
import PageHeader from '../../../components/warehouse/PageHeader';

const TABS = [
  { id: 'kho-kho', label: 'Kho Khô' },
  { id: 'kho-lanh', label: 'Kho Lạnh' },
  { id: 'kho-de-vo', label: 'Kho Dễ Vỡ' },
  { id: 'kho-hong', label: 'Kho Hỏng' },
  { id: 'kho-khac', label: 'Kho Khác' },
];

const FEE_DATA: Record<string, { cols: string[]; rows: string[][] }> = {
  'kho-kho': {
    cols: ['Loại container', 'Phí lưu kho/ngày', 'Phí bốc xếp', 'Phí quản lý', 'Phí phạt trễ/ngày'],
    rows: [
      ['20ft Khô', '₫500K', '₫1.2M', '₫200K', '₫300K'],
      ['40ft Khô', '₫850K', '₫2.0M', '₫350K', '₫500K'],
      ['40ft HC', '₫950K', '₫2.2M', '₫400K', '₫550K'],
    ],
  },
  'kho-lanh': {
    cols: ['Loại container', 'Phí lưu kho/ngày', 'Phí điện/ngày', 'Phí bảo trì', 'Phí phạt trễ/ngày'],
    rows: [
      ['Reefer 20ft', '₫1.2M', '₫800K', '₫300K', '₫600K'],
      ['Reefer 40ft', '₫1.8M', '₫1.2M', '₫500K', '₫900K'],
    ],
  },
  'kho-de-vo': {
    cols: ['Loại hàng', 'Phí lưu kho/ngày', 'Phí bảo hiểm', 'Phí bốc xếp đặc biệt', 'Phí phạt hỏng'],
    rows: [
      ['Thủy tinh / Gốm sứ', '₫700K', '₫400K', '₫1.5M', '₫5M/kiện'],
      ['Thiết bị điện tử', '₫900K', '₫600K', '₫2M', '₫8M/kiện'],
    ],
  },
  'kho-hong': {
    cols: ['Loại hỏng', 'Phí lưu/ngày', 'Phí xử lý', 'Phí bồi thường tối thiểu'],
    rows: [
      ['Hỏng nhẹ (có thể sửa)', '₫300K', '₫2M', '₫1M'],
      ['Hỏng nặng (không sửa được)', '₫500K', '₫5M', '₫10M'],
    ],
  },
  'kho-khac': {
    cols: ['Loại dịch vụ', 'Đơn giá', 'Phí phát sinh'],
    rows: [
      ['Phí cổng (Gate fee)', '₫200K/lượt', '₫50K'],
      ['Phí kiểm tra hải quan', '₫500K/lần', '₫100K'],
      ['Phí vệ sinh container', '₫300K', '₫100K'],
    ],
  },
};

export default function QuanLyCuocPhi() {
  const [tab, setTab] = useState('kho-kho');
  const [open, setOpen] = useState(false);
  const current = FEE_DATA[tab];

  return (
    <>
      <PageHeader
        title="Quản lý cước phí"
        subtitle="Bảng tính cước phí theo từng loại kho"
      />

      <div className="tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`tab-btn${tab === item.id ? ' active' : ''}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-header" style={{ justifyContent: 'space-between' }}>
          <div>
            <div className="card-title">Bảng cước phí {TABS.find((item) => item.id === tab)?.label}</div>
            <div className="card-subtitle">Cập nhật mức phí theo loại trong kho</div>
          </div>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(true)}>+ Thêm mức phí</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{current.cols.map((col) => <th key={col}>{col}</th>)}</tr>
            </thead>
            <tbody>
              {current.rows.map((row, index) => (
                <tr key={index}>{row.map((cell, idx) => <td key={idx}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`modal-overlay${open ? ' open' : ''}`} onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
        <div className="modal">
          <div className="modal-header">
            <div className="modal-title">Thêm mức phí</div>
            <button type="button" className="modal-close" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Loại container/hàng</label>
              <input className="form-input" placeholder="VD: 20ft Standard" />
            </div>
            <div className="form-group">
              <label className="form-label">Phí lưu kho/ngày (₫)</label>
              <input className="form-input" type="number" placeholder="500000" />
            </div>
            <div className="form-group">
              <label className="form-label">Phí bốc xếp (₫)</label>
              <input className="form-input" type="number" placeholder="1200000" />
            </div>
            <div className="form-group">
              <label className="form-label">Phí phạt trễ/ngày (₫)</label>
              <input className="form-input" type="number" placeholder="300000" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Hủy</button>
            <button type="button" className="btn btn-primary" onClick={() => { alert('Đã thêm mức phí!'); setOpen(false); }}>Thêm</button>
          </div>
        </div>
      </div>
    </>
  );
}

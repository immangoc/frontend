import { useMemo, useState } from 'react';
import { Container, MapPin, Clock, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';

const demoContainers = [
  { id: 'CMAU4567890', type: '40ft Khô', status: 'Đang lưu kho', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', location: 'Khu A - Vị trí 23', eta: '15/03/2026', etd: '15/04/2026', storageDays: 12, fee: '₫450K', category: 'dry' },
  { id: 'HLCU3456789', type: '20ft Lạnh', status: 'Chuẩn bị xuất', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', location: 'Khu B - Vị trí 45', eta: '20/03/2026', etd: '25/03/2026', storageDays: 7, fee: '₫380K', category: 'cold' },
  { id: 'MSCU2345678', type: '40ft HC', status: 'Đang lưu kho', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', location: 'Khu C - Vị trí 12', eta: '10/03/2026', etd: '18/04/2026', storageDays: 17, fee: '₫720K', category: 'other' },
  { id: 'VSCU1122334', type: '20ft Khô', status: 'Đang xuất', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', location: 'Khu B - Vị trí 08', eta: '22/03/2026', etd: '28/03/2026', storageDays: 5, fee: '₫310K', category: 'dry' },
  { id: 'TIPU9988776', type: '40ft Hỏng', status: 'Đang lưu kho', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', location: 'Khu D - Vị trí 19', eta: '01/03/2026', etd: '10/04/2026', storageDays: 24, fee: '₫1.1M', category: 'damaged' },
  { id: 'TGHU2233445', type: '20ft Dễ vỡ', status: 'Đang lưu kho', badge: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', location: 'Khu E - Vị trí 03', eta: '08/03/2026', etd: '18/04/2026', storageDays: 16, fee: '₫620K', category: 'fragile' },
];

const categories = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Kho hỏng', value: 'damaged' },
  { label: 'Kho khô', value: 'dry' },
  { label: 'Kho lạnh', value: 'cold' },
  { label: 'Kho dễ vỡ', value: 'fragile' },
  { label: 'Kho khác', value: 'other' },
];

export default function MyContainers() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    return demoContainers.filter((item) => {
      const matchesQuery = item.id.toLowerCase().includes(query.toLowerCase()) || item.type.toLowerCase().includes(query.toLowerCase()) || item.location.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || item.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title">Container của tôi</h1>
            <p className="page-subtitle">Xem trạng thái, vị trí và phân loại container của bạn theo tổng hợp kho.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Điều hướng kho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {categories.map((item) => (
                <button
                  key={item.value}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${category === item.value ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300'}`}
                  onClick={() => setCategory(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 w-full">
              <CardTitle>Danh sách container</CardTitle>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo mã container, loại hoặc vị trí..."
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[640px] overflow-y-auto pr-2">
            {filtered.map((container) => (
              <div key={container.id} className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="rounded-3xl bg-blue-500 p-3 text-white">
                      <Container className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{container.id}</h2>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${container.badge}`}>{container.status}</span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{container.location}</div>
                        <div><span className="font-semibold">Loại:</span> {container.type}</div>
                        <div><span className="font-semibold">Ngày nhập:</span> {container.eta}</div>
                        <div><span className="font-semibold">Lưu:</span> {container.storageDays} ngày</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-xl font-bold text-gray-900 dark:text-white">{container.fee}</div>
                    <Button variant="outline" size="sm">Chi tiết</Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center text-gray-500 dark:text-gray-400">Không có container phù hợp.</div>}
          </CardContent>
        </Card>
      </div>
    </WarehouseLayout>
  );
}

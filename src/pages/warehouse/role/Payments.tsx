import { useState } from 'react';
import { CalendarDays, DollarSign, FileText, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';

const rateTable = [
  { service: 'Kho khô', unit: 'ft/ngày', price: '₫45K' },
  { service: 'Kho lạnh', unit: 'ft/ngày', price: '₫75K' },
  { service: 'Kho dễ vỡ', unit: 'ft/ngày', price: '₫95K' },
  { service: 'Kho hỏng', unit: 'ft/ngày', price: '₫120K' },
];

const cargoTypes = ['Khô', 'Lạnh', 'Dễ vỡ', 'Hỏng', 'Khác'];

export default function Payments() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cargoType, setCargoType] = useState('Khô');
  const [result, setResult] = useState<string | null>(null);

  const handleLookup = () => {
    if (!startDate || !endDate) {
      setResult('Vui lòng chọn đủ ngày nhập và ngày xuất.');
      return;
    }
    const days = Math.max(1, Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
    const baseRate = cargoType === 'Khô' ? 45 : cargoType === 'Lạnh' ? 75 : cargoType === 'Dễ vỡ' ? 95 : cargoType === 'Hỏng' ? 120 : 55;
    setResult(`Ước tính: ${days} ngày × ${baseRate}K = ₫${days * baseRate}K`);
  };

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title">Tra cứu & tiện ích</h1>
            <p className="page-subtitle">Tra cứu cước phí theo ngày nhập, ngày xuất và loại hàng.</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5" />
                Tra cứu cước phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">Ngày nhập</label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12" />
                </div>
                <div>
                  <label className="form-label">Ngày xuất</label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12" />
                </div>
              </div>

              <div>
                <label className="form-label">Loại hàng</label>
                <select
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="form-input h-12"
                >
                  {cargoTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleLookup}>
                Tra cứu
              </Button>

              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">Kết quả ước tính cước phí</div>
                <div className="mt-3 min-h-[52px] text-base font-semibold text-gray-900 dark:text-white">
                  {result || 'Nhấn Tra cứu để hiển thị số tiền.'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Biểu cước kho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {rateTable.map((item) => (
                <div key={item.service} className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.service}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.unit}</p>
                    </div>
                    <div className="text-base font-semibold text-gray-900 dark:text-white">{item.price}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tiện ích nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Tra cứu cước phí</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Nhập ngày nhập, ngày xuất và loại hàng để biết chi phí.</p>
              </div>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Biểu cước kho</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Xem nhanh giá kho khô, lạnh, dễ vỡ và hỏng.</p>
              </div>
              <div className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Bảng giá nhanh</div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">So sánh cước trước khi đặt booking.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </WarehouseLayout>
  );
}

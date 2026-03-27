import { useMemo, useState, ChangeEvent } from 'react';
import { FileText, Search, Clock, DollarSign, XCircle, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import WarehouseLayout from '../../../components/warehouse/WarehouseLayout';

interface OrderItem {
  id: string;
  date: string;
  status: string;
  items: number;
  total: string;
}

const demoOrders: OrderItem[] = [
  { id: 'ORD-1234', date: '2026-03-19 10:30', status: 'Đã giao', items: 5, total: '₫2.5M' },
  { id: 'ORD-1235', date: '2026-03-19 09:15', status: 'Đang xử lý', items: 3, total: '₫1.8M' },
  { id: 'ORD-1236', date: '2026-03-18 16:45', status: 'Đang giao', items: 8, total: '₫3.2M' },
  { id: 'ORD-1237', date: '2026-03-18 14:20', status: 'Chờ xử lý', items: 2, total: '₫950K' },
  { id: 'ORD-1238', date: '2026-03-17 11:00', status: 'Đã giao', items: 12, total: '₫4.1M' },
  { id: 'ORD-1239', date: '2026-03-17 08:30', status: 'Đã hủy', items: 4, total: '₫1.6M' },
  { id: 'ORD-1240', date: '2026-03-16 15:10', status: 'Đang xử lý', items: 6, total: '₫2.9M' },
  { id: 'ORD-1241', date: '2026-03-16 12:45', status: 'Đang giao', items: 9, total: '₫3.7M' },
];

const bookingOptions = [
  { id: 'BK-01', name: 'Booking Khô 20ft', note: 'Nhập kho nhanh, bảo quản tiêu chuẩn', price: '₫4.2M' },
  { id: 'BK-02', name: 'Booking Lạnh 40ft', note: 'Kiểm soát nhiệt độ, lưu kho lạnh', price: '₫7.8M' },
  { id: 'BK-03', name: 'Booking Dễ vỡ', note: 'Xử lý an toàn, đóng gói riêng', price: '₫6.1M' },
];

const statusOptions = ['Tất cả', 'Chờ xử lý', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];
const cargoTypes = ['Khô', 'Lạnh', 'Dễ vỡ', 'Khác'];

export default function Orders() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Tất cả');
  const [showBooking, setShowBooking] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);
  const [bookingStartDate, setBookingStartDate] = useState('');
  const [bookingEndDate, setBookingEndDate] = useState('');
  const [cargoType, setCargoType] = useState('Khô');
  const [weight, setWeight] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRequest, setEditRequest] = useState('');
  const [activeOrder, setActiveOrder] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return demoOrders.filter((order) => {
      const matchesQuery = order.id.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === 'Tất cả' || order.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  const handleCancelOrder = (orderId: string) => {
    alert(`Yêu cầu hủy đơn ${orderId} đã được gửi.`);
  };

  const handleEditRequest = (orderId: string) => {
    setActiveOrder(orderId);
    setEditRequest('');
    setIsEditModalOpen(true);
  };

  const handleBookCheckout = (optionId: string) => {
    if (!bookingStartDate || !bookingEndDate || !cargoType || !weight || !companyName) {
      alert('Vui lòng nhập đầy đủ: ngày nhập, ngày xuất, loại hàng, trọng lượng và tên công ty.');
      return;
    }

    setSelectedBooking(optionId);
    alert(`Đặt booking ${optionId} thành công cho công ty ${companyName}.`);
  };

  const handleSubmitEditRequest = () => {
    setIsEditModalOpen(false);
    alert(`Yêu cầu chỉnh sửa cho ${activeOrder} đã được gửi.`);
  };

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="page-title">Quản lý đơn hàng</h1>
            <p className="page-subtitle">Theo dõi và quản lý tất cả đơn hàng của bạn.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <FileText className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tổng đơn hàng</p>
              <p className="mt-3 text-3xl font-semibold text-blue-600">1,234</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang xử lý</p>
              <p className="mt-3 text-3xl font-semibold text-amber-600">156</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đang giao hàng</p>
              <p className="mt-3 text-3xl font-semibold text-violet-600">89</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">Đã hoàn thành</p>
              <p className="mt-3 text-3xl font-semibold text-emerald-600">989</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>Danh sách đơn hàng</CardTitle>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                      value={query}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                      placeholder="Tìm kiếm mã đơn..."
                      className="pl-10 h-12"
                    />
                  </div>
                  <select
                    value={status}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatus(e.target.value)}
                    className="h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 shadow-sm outline-none focus:border-blue-500"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="py-3 px-4">Mã đơn hàng</th>
                      <th className="py-3 px-4">Ngày đặt</th>
                      <th className="py-3 px-4">Số SP</th>
                      <th className="py-3 px-4">Tổng tiền</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order: OrderItem) => (
                      <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">{order.id}</td>
                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{order.date}</td>
                        <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{order.items}</td>
                        <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{order.total}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            order.status === 'Đã giao' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                            order.status === 'Đang giao' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' :
                            order.status === 'Đang xử lý' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                            order.status === 'Chờ xử lý' ? 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' :
                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>{order.status}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEditRequest(order.id)}>
                              <Edit3 className="w-4 h-4" />
                              Chỉnh sửa
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleCancelOrder(order.id)}>
                              <XCircle className="w-4 h-4" />
                              Hủy
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Booking & thanh toán
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowBooking((prev: boolean) => !prev)}>
                {showBooking ? 'Ẩn bảng booking' : 'Hiển thị bảng booking'}
              </Button>

              {showBooking ? (
                <div className="space-y-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Nhập ngày nhập, ngày xuất và thông tin booking trước khi thanh toán.</div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="form-label">Ngày nhập</label>
                      <Input type="date" value={bookingStartDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setBookingStartDate(e.target.value)} className="h-12" />
                    </div>
                    <div>
                      <label className="form-label">Ngày xuất</label>
                      <Input type="date" value={bookingEndDate} onChange={(e: ChangeEvent<HTMLInputElement>) => setBookingEndDate(e.target.value)} className="h-12" />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="form-label">Loại hàng</label>
                      <select
                        value={cargoType}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setCargoType(e.target.value)}
                        className="form-input h-12"
                      >
                        {cargoTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Trọng lượng (kg)</label>
                      <Input
                        value={weight}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
                        placeholder="VD: 1200"
                        className="h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Tên công ty</label>
                    <Input
                      value={companyName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                      placeholder="Nhập tên công ty"
                      className="h-12"
                    />
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-700 dark:text-gray-300">
                      <thead className="border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="py-3 px-3">Booking</th>
                          <th className="py-3 px-3">Mô tả</th>
                          <th className="py-3 px-3">Giá</th>
                          <th className="py-3 px-3">Thanh toán</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookingOptions.map((option) => (
                          <tr key={option.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{option.name}</td>
                            <td className="py-3 px-3 text-gray-500 dark:text-gray-400">{option.note}</td>
                            <td className="py-3 px-3 font-semibold">{option.price}</td>
                            <td className="py-3 px-3">
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => handleBookCheckout(option.id)}>
                                Thanh toán
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {selectedBooking && (
                    <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-100">
                      <div className="font-semibold">Đang xử lý thanh toán</div>
                      <div className="mt-2">Booking: {bookingOptions.find((item) => item.id === selectedBooking)?.name}</div>
                      <div className="mt-1">Đơn vị: {companyName}</div>
                      <div className="mt-1">Trọng lượng: {weight} kg</div>
                      <div className="mt-1">Giá: {bookingOptions.find((item) => item.id === selectedBooking)?.price}</div>
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700" onClick={() => alert('Thanh toán booking (demo)')}>
                        Xác nhận thanh toán
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-900 p-4 text-sm text-gray-500 dark:text-gray-400">
                  Nhấn vào nút để xem bảng booking và thanh toán nhanh.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className={`modal-overlay ${isEditModalOpen ? 'open' : ''}`}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Yêu cầu chỉnh sửa</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gửi yêu cầu chỉnh sửa cho đơn {activeOrder}.</p>
              </div>
              <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="form-label">Nội dung yêu cầu</label>
                <textarea
                  value={editRequest}
                  onChange={(e) => setEditRequest(e.target.value)}
                  className="form-input min-h-[120px] w-full"
                  placeholder="Mô tả chi tiết thay đổi bạn cần..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Hủy</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSubmitEditRequest}>Gửi yêu cầu</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WarehouseLayout>
  );
}

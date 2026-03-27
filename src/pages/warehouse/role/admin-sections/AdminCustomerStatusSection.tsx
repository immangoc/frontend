import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw, Search, Shield, UserX, UserCheck, AlertTriangle } from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { useWarehouseAuth } from '../../../../contexts/WarehouseAuthContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';

type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: 'admin' | 'planner' | 'operator' | 'customer';
  status?: 'active' | 'inactive' | string;
  created_at?: string;
};

export default function AdminCustomerStatusSection({
  mode,
  showLayout = true,
}: {
  mode: 'suspend' | 'approve';
  showLayout?: boolean;
}) {
  const { accessToken, user: currentUser } = useWarehouseAuth();

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionBusy, setActionBusy] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/users`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lấy người dùng');
      setUsers((data.users || []) as User[]);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const customers = useMemo(() => users.filter((u) => u.role === 'customer'), [users]);

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return customers;
    return customers.filter((u) => `${u.name} ${u.email} ${u.company || ''}`.toLowerCase().includes(k));
  }, [customers, keyword]);

  const canToggle = (u: User) => {
    if (u.id === currentUser?.id) return false;
    if (!u.id) return false;
    return true;
  };

  const toggleStatus = async (u: User) => {
    const desired = mode === 'suspend' ? (u.status === 'active' ? 'inactive' : 'active') : u.status === 'active' ? 'inactive' : 'active';
    // Với approve: inactive -> active, active -> inactive (tương đương Duyệt/Từ chối)
    try {
      setActionBusy(true);
      const res = await fetch(`${apiUrl}/users/${u.id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: desired }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi cập nhật trạng thái');
      await fetchUsers();
    } catch (e: any) {
      alert(e.message || 'Lỗi không xác định');
    } finally {
      setActionBusy(false);
    }
  };

  const title =
    mode === 'suspend' ? 'Quản lý Khách hàng (tạm ngưng hoạt động)' : 'Duyệt tài khoản khách hàng';

  const actionText = (u: User) => {
    const active = u.status === 'active';
    if (mode === 'suspend') return active ? 'Tạm ngưng' : 'Kích hoạt lại';
    return active ? 'Từ chối' : 'Duyệt';
  };

  const actionIcon = (u: User) => {
    const active = u.status === 'active';
    if (mode === 'suspend') return active ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />;
    return active ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />;
  };

  const content = (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Bật/tắt trạng thái tài khoản khách hàng.</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1">{error}</span>
            <Button size="sm" variant="outline" onClick={fetchUsers} disabled={loading}>
              Thử lại
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Danh sách khách hàng ({filtered.length})
            </CardTitle>
            <div className="mt-3 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Tìm theo tên/email/công ty..."
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={fetchUsers} disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Làm mới
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-gray-600 dark:text-gray-400">Đang tải...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Thông tin</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => {
                    const active = u.status === 'active';
                    return (
                      <TableRow
                        key={u.id}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() => {
                          setSelectedUser(u);
                          setDetailOpen(true);
                        }}
                      >
                        <TableCell className="font-semibold">
                          {u.name}
                          <div className="text-sm text-gray-500 font-normal">{u.email}</div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {u.company || '—'} {u.phone ? `• ${u.phone}` : ''}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            className={
                              active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                            }
                          >
                            {active ? 'active' : 'inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Bấm để xử lý</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-10">
                        Không có khách hàng phù hợp.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={(o) => (setDetailOpen(o), !o && setSelectedUser(null))}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Chi tiết tài khoản</DialogTitle>
              <DialogDescription>
                {selectedUser ? `Xử lý nhanh cho ${selectedUser.name}` : '—'}
              </DialogDescription>
            </DialogHeader>

            {selectedUser && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Thông tin</div>
                  <div className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
                    <div><span className="font-semibold">{selectedUser.name}</span> ({selectedUser.email})</div>
                    <div>{selectedUser.company || '—'} {selectedUser.phone ? `• ${selectedUser.phone}` : ''}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-700">Trạng thái hiện tại</div>
                  {(() => {
                    const active = selectedUser.status === 'active';
                    return (
                      <Badge
                        className={
                          active
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                        }
                      >
                        {active ? 'active' : 'inactive'}
                      </Badge>
                    );
                  })()}
                </div>

                <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 p-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      {mode === 'suspend' ? (
                        selectedUser.status === 'active' ? (
                          <>Tài khoản đang hoạt động. Bạn có thể tạm ngưng.</>
                        ) : (
                          <>Tài khoản đang bị tạm ngưng. Bạn có thể kích hoạt lại.</>
                        )
                      ) : selectedUser.status === 'active' ? (
                        <>Tài khoản đang active. Bạn có thể từ chối (chuyển sang inactive).</>
                      ) : (
                        <>Tài khoản đang inactive. Bạn có thể duyệt (chuyển sang active).</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailOpen(false)} disabled={actionBusy}>
                Đóng
              </Button>
              <Button
                className={`${
                  selectedUser && selectedUser.status === 'active'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-900 hover:bg-blue-800 text-white'
                }`}
                onClick={async () => {
                  if (!selectedUser) return;
                  await toggleStatus(selectedUser);
                  setDetailOpen(false);
                }}
                disabled={!selectedUser || actionBusy || !canToggle(selectedUser)}
              >
                {selectedUser && actionIcon(selectedUser)}
                {actionBusy ? 'Đang xử lý...' : selectedUser ? actionText(selectedUser) : '—'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );

  return showLayout ? <WarehouseLayout>{content}</WarehouseLayout> : content;
}


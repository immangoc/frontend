import { useState } from 'react';
import { Shield, Users, UserCheck, UserX, KeySquare } from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import UserManagement from '../../UserManagement';
import AdminCustomerStatusSection from './AdminCustomerStatusSection';
import AdminPermissionsSection from './AdminPermissionsSection';

type CustomerMode = 'suspend' | 'approve';

export default function AdminSystemMergedSection() {
  const [tab, setTab] = useState<'users' | 'customers' | 'permissions'>('users');
  const [customerMode, setCustomerMode] = useState<CustomerMode>('suspend');

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản trị hệ thống</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gộp quản lý người dùng, quản lý khách hàng (tạm ngưng/duyệt) và phân quyền.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Điều hướng</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row gap-2 lg:items-start">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={tab === 'users' ? 'default' : 'outline'}
                onClick={() => setTab('users')}
                className={tab === 'users' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
              >
                <Users className="w-4 h-4 mr-2" />
                Người dùng
              </Button>
              <Button
                variant={tab === 'customers' ? 'default' : 'outline'}
                onClick={() => setTab('customers')}
                className={tab === 'customers' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
              >
                <Shield className="w-4 h-4 mr-2" />
                Khách hàng
              </Button>
              <Button
                variant={tab === 'permissions' ? 'default' : 'outline'}
                onClick={() => setTab('permissions')}
                className={tab === 'permissions' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
              >
                <KeySquare className="w-4 h-4 mr-2" />
                Phân quyền
              </Button>
            </div>

            {tab === 'customers' && (
              <div className="flex gap-2 flex-wrap mt-3 lg:mt-0">
                <Button
                  variant={customerMode === 'suspend' ? 'default' : 'outline'}
                  onClick={() => setCustomerMode('suspend')}
                  className={customerMode === 'suspend' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
                >
                  <UserX className="w-4 h-4 mr-2" />
                  Tạm ngưng
                </Button>
                <Button
                  variant={customerMode === 'approve' ? 'default' : 'outline'}
                  onClick={() => setCustomerMode('approve')}
                  className={customerMode === 'approve' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Duyệt
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          {tab === 'users' && <UserManagement showLayout={false} />}
          {tab === 'customers' && <AdminCustomerStatusSection mode={customerMode} showLayout={false} />}
          {tab === 'permissions' && <AdminPermissionsSection showLayout={false} />}
        </div>
      </div>
    </WarehouseLayout>
  );
}


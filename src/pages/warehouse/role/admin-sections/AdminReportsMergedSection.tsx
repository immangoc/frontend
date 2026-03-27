import { useState } from 'react';
import { BarChart3, Download, Package, Users, TrendingUp } from 'lucide-react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import AdminReportsSection from './AdminReportsSection';

type Mode = 'revenue_profit' | 'performance' | 'inventory' | 'customer_stats' | 'export_report';

export default function AdminReportsMergedSection() {
  const [mainTab, setMainTab] = useState<'stats' | 'export'>('stats');
  const [statsMode, setStatsMode] = useState<Mode>('revenue_profit');

  const activeMode: Mode = mainTab === 'export' ? 'export_report' : statsMode;

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Điều hướng</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col lg:flex-row gap-4 lg:items-start">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={mainTab === 'stats' ? 'default' : 'outline'}
                onClick={() => setMainTab('stats')}
                className={mainTab === 'stats' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Thống kê
              </Button>
              <Button
                variant={mainTab === 'export' ? 'default' : 'outline'}
                onClick={() => setMainTab('export')}
                className={mainTab === 'export' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
              >
                <Download className="w-4 h-4 mr-2" />
                Xuất báo cáo
              </Button>
            </div>

            {mainTab === 'stats' && (
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statsMode === 'revenue_profit' ? 'default' : 'outline'}
                  onClick={() => setStatsMode('revenue_profit')}
                  className={statsMode === 'revenue_profit' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Doanh thu & lợi nhuận
                </Button>
                <Button
                  variant={statsMode === 'performance' ? 'default' : 'outline'}
                  onClick={() => setStatsMode('performance')}
                  className={statsMode === 'performance' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
                >
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Hiệu suất
                </Button>
                <Button
                  variant={statsMode === 'inventory' ? 'default' : 'outline'}
                  onClick={() => setStatsMode('inventory')}
                  className={statsMode === 'inventory' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
                >
                  <Package className="w-4 h-4 mr-2" />
                  Tồn kho
                </Button>
                <Button
                  variant={statsMode === 'customer_stats' ? 'default' : 'outline'}
                  onClick={() => setStatsMode('customer_stats')}
                  className={statsMode === 'customer_stats' ? 'bg-blue-900 hover:bg-blue-800 text-white' : ''}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Khách hàng
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Render nội dung báo cáo, không lồng WarehouseLayout lần nữa */}
        <AdminReportsSection mode={activeMode} showLayout={false} />
      </div>
    </WarehouseLayout>
  );
}


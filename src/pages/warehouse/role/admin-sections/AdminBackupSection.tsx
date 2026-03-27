import { useState } from 'react';
import WarehouseLayout from '../../../../components/warehouse/WarehouseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Download, AlertCircle, Shield, RefreshCw } from 'lucide-react';
import { useWarehouseAuth } from '../../../../contexts/WarehouseAuthContext';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';

export default function AdminBackupSection() {
  const { accessToken } = useWarehouseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-ce1eb60c`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  };

  const downloadJson = (filename: string, obj: any) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const backup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/admin/backup`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi sao lưu dữ liệu');
      downloadJson(`backup_${new Date().toISOString().slice(0, 10)}.json`, data);
    } catch (e: any) {
      setError(e.message || 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WarehouseLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Sao lưu dữ liệu</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Tải xuống bản sao lưu dạng JSON (users/containers/activities/...)</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="w-5 h-5" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Backup an toàn (Admin)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              File backup sẽ chứa các bucket dữ liệu hiện có trong hệ thống (theo cấu trúc Edge function).
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={backup} disabled={loading} className="bg-blue-900 hover:bg-blue-800 text-white">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Đang sao lưu...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Tải bản sao lưu
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </WarehouseLayout>
  );
}


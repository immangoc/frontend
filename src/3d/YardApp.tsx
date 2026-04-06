import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { WarehouseOverview } from './pages/WarehouseOverview';
import { Warehouse3D } from './pages/Warehouse3D';
import { Warehouse2D } from './pages/Warehouse2D';
import { HaBai } from './pages/HaBai';
import { XuatBai } from './pages/XuatBai';
import { Kho } from './pages/Kho';
import { KiemSoat } from './pages/KiemSoat';
import { fetchAllYards } from './services/yardService';
import { processApiYards, setYardData } from './store/yardStore';
import { fetchAndSetOccupancy } from './services/containerPositionService';

export default function YardApp() {
  useEffect(() => {
    fetchAllYards()
      .then((yards) => {
        setYardData(processApiYards(yards));
        return fetchAndSetOccupancy(yards);
      })
      .catch(() => {
        // Fetch failed — scenes will continue using mock data
      });
  }, []);

  return (
    <Routes>
      <Route index element={<Navigate to="tong-quan" replace />} />
      <Route path="tong-quan" element={<WarehouseOverview />} />
      <Route path="3d" element={<Warehouse3D />} />
      <Route path="2d" element={<Warehouse2D />} />
      <Route path="ha-bai" element={<HaBai />} />
      <Route path="xuat-bai" element={<XuatBai />} />
      <Route path="kho" element={<Kho />} />
      <Route path="kiem-soat" element={<KiemSoat />} />
    </Routes>
  );
}

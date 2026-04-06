import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import {
  Search, Plus, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Compass,
  Package, Calendar, Truck, Snowflake, AlertTriangle, Layers, Info,
  Shuffle, RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { WarehouseScene } from '../components/3d/WarehouseScene';
import type { SceneHandle } from '../components/3d/WarehouseScene';
import { Legend } from '../components/ui/Legend';
// Phase 6: WAITING_CONTAINERS replaced by fetchWaitingContainers

import type { WHType, ZoneInfo, WHStat, PreviewPosition } from '../data/warehouse';
import { useDashboardStats } from '../hooks/useDashboardStats';
import {
  subscribe, getImportedContainers, cargoTypeToWHType, cargoTypeToWHName,
} from '../data/containerStore';
import type { SuggestedPosition } from '../data/containerStore';
import { fetchRecommendation, confirmGateIn, resolveYardId } from '../services/gateInService';
import type { GateInParams } from '../services/gateInService';
import { fetchAndSetOccupancy } from '../services/containerPositionService';
import { fetchAllYards } from '../services/yardService';
import { processApiYards, setYardData } from '../store/yardStore';
import { fetchWaitingContainers } from '../services/gateOutService';
import type { WaitingItem } from '../services/gateOutService';
import { OptimizationPanel } from '../components/OptimizationPanel';
import './Warehouse3D.css';

// Phase 2: WH_TABS now comes from useDashboardStats hook inside the component

// ─── Icons ────────────────────────────────────────────────────────────────────
function WHIcon({ type, size = 18 }: { type: WHType; size?: number }) {
  if (type === 'cold')    return <Snowflake     size={size} />;
  if (type === 'dry')     return <Package       size={size} />;
  if (type === 'fragile') return <AlertTriangle size={size} />;
  return                         <Layers        size={size} />;
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ wh }: { wh: WHStat }) {
  return (
    <div className="stat-card">
      <div className="stat-left">
        <p className="stat-name">{wh.name}</p>
        <p className="stat-pct" style={{ color: wh.color }}>{wh.pct}</p>
        <p className="stat-sub">{wh.empty} vị trí trống</p>
      </div>
      <div className="stat-icon-wrap" style={{ backgroundColor: wh.bgColor }}>
        <span style={{ color: wh.color }}><WHIcon type={wh.id} size={22} /></span>
      </div>
    </div>
  );
}

// ─── Donut chart ─────────────────────────────────────────────────────────────
function DonutChart({ pct }: { pct: number }) {
  const r = 48, c = 2 * Math.PI * r;
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#E5E7EB" strokeWidth="14" />
      <circle cx="65" cy="65" r={r} fill="none" stroke="#1E3A8A" strokeWidth="14"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        strokeLinecap="round" transform="rotate(-90 65 65)" />
      <text x="65" y="70" textAnchor="middle" fontSize="20" fontWeight="700" fill="#111827">{pct}%</text>
    </svg>
  );
}

// ─── Zone info panel ──────────────────────────────────────────────────────────
function ZoneInfoPanel({ zone }: { zone: ZoneInfo }) {
  const isWarning = zone.fillRate >= 90;

  // Use real data from store
  const imported = useSyncExternalStore(subscribe, getImportedContainers);
  const whTypeMap: Record<string, WHType> = {
    'Kho Lạnh': 'cold', 'Kho Khô': 'dry', 'Kho Hàng dễ vỡ': 'fragile', 'Kho khác': 'other',
  };
  const whType = whTypeMap[zone.type];
  const recentFromStore = whType
    ? imported.filter((c) => c.whType === whType && c.zone === zone.name).slice(0, 5)
    : [];
  const recentCodes = recentFromStore.length > 0
    ? recentFromStore.map((c) => `${c.code} (${c.zone} T${c.floor})`)
    : zone.recentContainers;

  return (
    <div className="w3d-right-panel">
      <div className="rp-zone-header">
        <h2 className="rp-zone-name">{zone.name}</h2>
        <p className="rp-zone-type">{zone.type}</p>
      </div>
      {isWarning && (
        <div className="rp-warning-banner">
          <AlertTriangle size={16} />
          <span>Cảnh báo: Khu vực gần đầy ({zone.fillRate}%)</span>
        </div>
      )}
      <div className="rp-section-label">Tỷ lệ lấp đầy</div>
      <div className="rp-donut-wrap"><DonutChart pct={zone.fillRate} /></div>
      <p className="rp-stat">Số vị trí trống: <strong>{zone.emptySlots}/{zone.totalSlots}</strong></p>
      <div className="rp-section-label rp-mt">Danh sách Container nhập gần đây:</div>
      <ul className="rp-container-list">
        {recentCodes.length > 0
          ? recentCodes.map((c) => <li key={c}>{c}</li>)
          : <li style={{ color: '#9CA3AF', fontSize: '12px' }}>Chưa có container nhập gần đây</li>
        }
      </ul>
    </div>
  );
}

// ─── Waiting list panel ───────────────────────────────────────────────────────
function WaitingListPanel({ onClose, onSelect, refreshKey }: {
  onClose: () => void;
  onSelect: (item: WaitingItem) => void;
  refreshKey?: number;
}) {
  const [items, setItems]   = useState<WaitingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchWaitingContainers()
      .then((data) => setItems(data))
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải danh sách'))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  return (
    <div className="w3d-right-panel">
      <div className="rp-import-header">
        <button className="rp-back-btn" onClick={onClose}><ChevronLeft size={18} /></button>
        <h2 className="rp-import-title">Container chờ nhập</h2>
      </div>
      <div className="rp-import-body">
        {loading && <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>Đang tải...</p>}
        {error   && <p style={{ fontSize: '0.8rem', color: '#f87171', textAlign: 'center', padding: '1rem 0' }}>{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center', padding: '1rem 0' }}>Không có container đang chờ.</p>
        )}
        {items.map((ctn) => (
          <button
            key={`${ctn.orderId}-${ctn.containerCode}`}
            className="waiting-item"
            onClick={() => onSelect(ctn)}
          >
            <div className="waiting-icon"><Truck size={18} /></div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <span className="waiting-code">{ctn.containerCode || `Order #${ctn.orderId}`}</span>
              {(ctn.cargoType || ctn.containerType) && (
                <div style={{ fontSize: '0.72rem', color: '#6b7280', marginTop: '2px' }}>
                  {[ctn.cargoType, ctn.containerType].filter(Boolean).join(' · ')}
                  {ctn.weight ? ` · ${Number(ctn.weight).toLocaleString()} kg` : ''}
                </div>
              )}
              {ctn.customerName && (
                <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>{ctn.customerName}</div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Import panel ─────────────────────────────────────────────────────────────
type ImportStep = 'form' | 'suggestion' | 'manual';

/** Map a backend cargoTypeName to one of the form's dropdown values. */
function normalizeCargoType(raw: string): string {
  const s = raw.toLowerCase();
  if (s.includes('lạnh'))               return 'Hàng Lạnh';
  if (s.includes('vỡ') || s.includes('dễ')) return 'Hàng Dễ Vỡ';
  if (s.includes('nguy'))               return 'Hàng Nguy Hiểm';
  return 'Hàng Khô';
}

function ImportPanel({ onClose, initialCode, initialItem, onPreviewChange }: {
  onClose: () => void;
  initialCode?: string;
  initialItem?: WaitingItem;
  onPreviewChange: (pos: PreviewPosition | null) => void;
}) {
  const [step, setStep] = useState<ImportStep>('form');
  const [form, setForm] = useState({
    containerCode: initialItem?.containerCode ?? initialCode ?? '',
    cargoType: initialItem ? normalizeCargoType(initialItem.cargoType) : 'Hàng Khô',
    sizeType: (initialItem?.containerType?.toUpperCase().includes('40') ? '40ft' : '20ft') as '20ft' | '40ft',
    weight: initialItem?.weight ?? '',
    exportDate: '',
    priority: 'Cao',
  });
  const [suggestion, setSuggestion] = useState<SuggestedPosition | null>(null);
  const [manualZone, setManualZone]      = useState('Zone A');
  const [manualWarehouse, setManualWH]   = useState('Kho Khô');
  const [manualFloor, setManualFloor]    = useState('1');
  const [manualPos, setManualPos]        = useState('CT01');
  const [loading, setLoading]            = useState(false);
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    return () => onPreviewChange(null);
  }, [onPreviewChange]);

  // Phase 5: fetch recommendation from POST /admin/optimization/recommend
  async function handleGetSuggestion() {
    setLoading(true);
    setError(null);
    try {
      const sug = await fetchRecommendation(form.cargoType, form.weight, form.sizeType);
      setSuggestion(sug);
      setStep('suggestion');
      if (sug) {
        setManualZone(sug.zone);
        setManualWH(sug.whName);
        setManualFloor(String(sug.floor));
        setManualPos(sug.slot);
        onPreviewChange({
          whType: sug.whType,
          zone: sug.zone,
          floor: sug.floor,
          row: sug.row,
          col: sug.col,
          sizeType: sug.sizeType,
          containerCode: form.containerCode || 'Container mới',
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi kết nối');
      setStep('suggestion');
      setSuggestion(null);
    } finally {
      setLoading(false);
    }
  }

  // Phase 5 (fixed): gate-in → create container if needed → assign position
  async function handleConfirmImport() {
    const slotId = suggestion?.slotId;
    if (!slotId) {
      setError('Vui lòng lấy gợi ý vị trí trước khi xác nhận nhập kho');
      return;
    }

    setLoading(true);
    setError(null);

    const floor  = step === 'manual' ? parseInt(manualFloor) : (suggestion?.floor ?? 1);
    const yardId = resolveYardId(suggestion?.whName ?? manualWarehouse, suggestion?.whType ?? '');

    const params: GateInParams = {
      containerCode:      form.containerCode,
      cargoType:          form.cargoType,
      sizeType:           suggestion?.sizeType ?? form.sizeType,
      weight:             form.weight,
      exportDate:         form.exportDate,
      priority:           form.priority,
      yardId,
      slotId,
      tier:               floor,
      skipContainerCheck: !!initialItem,  // container from waiting list already exists
    };

    try {
      await confirmGateIn(params);
      onPreviewChange(null);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nhập kho thất bại');
      setLoading(false);
    }
  }

  function handleManualPositionChange(newZone: string, newFloor: string) {
    const whType = cargoTypeToWHType(manualWarehouse === 'Kho Lạnh' ? 'Hàng Lạnh'
      : manualWarehouse === 'Kho Hàng dễ vỡ' ? 'Hàng dễ vỡ'
      : manualWarehouse === 'Kho khác' ? 'Khác' : 'Hàng Khô');

    onPreviewChange({
      whType,
      zone: newZone,
      floor: parseInt(newFloor),
      row: suggestion?.row ?? 0,
      col: suggestion?.col ?? 0,
      sizeType: suggestion?.sizeType ?? form.sizeType,
      containerCode: form.containerCode || 'Container mới',
    });
  }

  return (
    <div className="w3d-right-panel">
      <div className="rp-import-header">
        <button className="rp-back-btn" onClick={step === 'form' ? () => { onPreviewChange(null); onClose(); } : () => { setStep('form'); onPreviewChange(null); }}>
          <ChevronLeft size={18} />
        </button>
        <h2 className="rp-import-title">Nhập Container</h2>
      </div>
      <div className="rp-import-body">
        {error && (
          <p style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '0.5rem', padding: '0.5rem', background: '#fef2f2', borderRadius: '6px' }}>
            {error}
          </p>
        )}
        {step === 'form' && (
          <>
            {initialItem && (
              <div style={{ fontSize: '0.75rem', background: '#eff6ff', color: '#1d4ed8', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '0.5rem' }}>
                Container từ danh sách chờ — thông tin đã điền sẵn
              </div>
            )}
            <div className="rp-field">
              <label>Mã số container</label>
              <input
                type="text"
                value={form.containerCode}
                placeholder="VD: CTN-2026-1234"
                readOnly={!!initialItem}
                style={initialItem ? { background: '#f9fafb', color: '#6b7280', cursor: 'default' } : undefined}
                onChange={(e) => { if (!initialItem) setForm({ ...form, containerCode: e.target.value }); }}
              />
            </div>
            <div className="rp-field">
              <label>Loại hàng</label>
              <div className="rp-select-wrap">
                <select value={form.cargoType}
                  onChange={(e) => setForm({ ...form, cargoType: e.target.value })}>
                  <option>Hàng Khô</option><option>Hàng Lạnh</option>
                  <option>Hàng Dễ Vỡ</option><option>Hàng Nguy Hiểm</option>
                </select>
              </div>
            </div>
            <div className="rp-field">
              <label>Loại container</label>
              <div className="rp-size-toggle">
                <button type="button"
                  className={`rp-size-btn ${form.sizeType === '20ft' ? 'rp-size-btn-active' : ''}`}
                  onClick={() => setForm({ ...form, sizeType: '20ft' })}>
                  20ft
                </button>
                <button type="button"
                  className={`rp-size-btn ${form.sizeType === '40ft' ? 'rp-size-btn-active' : ''}`}
                  onClick={() => setForm({ ...form, sizeType: '40ft' })}>
                  40ft
                </button>
              </div>
            </div>
            <div className="rp-field">
              <label>Trọng lượng</label>
              <input type="text" value={form.weight} placeholder="VD: 25 tấn"
                onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="rp-field">
              <label>Ngày xuất (dự kiến)</label>
              <div className="rp-date-wrap">
                <Calendar size={15} className="rp-date-icon" />
                <input type="date" value={form.exportDate}
                  onChange={(e) => setForm({ ...form, exportDate: e.target.value })} />
              </div>
            </div>
            <div className="rp-field">
              <label>Mức độ ưu tiên</label>
              <div className="rp-select-wrap">
                <select value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option>Cao</option><option>Trung bình</option><option>Thấp</option>
                </select>
              </div>
            </div>
            <button className="btn-primary rp-submit-btn" onClick={handleGetSuggestion} disabled={loading}>
              {loading ? 'Đang tải...' : 'Nhận gợi ý vị trí'}
            </button>
          </>
        )}

        {(step === 'suggestion' || step === 'manual') && (
          <>
            <div className="rp-suggestion-card">
              <div className="rp-sug-header">
                <div className="rp-sug-icon"><Info size={16} /></div>
                <span className="rp-sug-title">Gợi ý vị trí</span>
              </div>
              {suggestion ? (
                <>
                  <div className="rp-sug-row">
                    <span className="rp-sug-label">Vị trí</span>
                    <span className="rp-sug-value rp-blue">{suggestion.zone} - {suggestion.whName}<br />Tầng {suggestion.floor} - {suggestion.slot}</span>
                  </div>
                  <div className="rp-sug-row">
                    <span className="rp-sug-label">Hiệu quả tối ưu</span>
                    <span className="rp-sug-value rp-blue">{suggestion.efficiency}%</span>
                  </div>
                  <div className="rp-sug-row">
                    <span className="rp-sug-label">Số Container<br />đảo chuyển</span>
                    <span className="rp-sug-value rp-blue">{suggestion.moves}</span>
                  </div>
                </>
              ) : (
                <div className="rp-sug-row">
                  <span className="rp-sug-label">Không tìm thấy vị trí trống</span>
                </div>
              )}
            </div>

            {step === 'suggestion' && (
              <>
                <button className="btn-primary rp-submit-btn" onClick={handleConfirmImport} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận nhập'}
                </button>
                <button className="rp-cancel-link" disabled={loading} onClick={() => setStep('manual')}>Điều chỉnh thủ công</button>
                <button className="rp-cancel-link" disabled={loading} onClick={() => { onPreviewChange(null); onClose(); }}>Hủy</button>
              </>
            )}

            {step === 'manual' && (
              <>
                <div className="rp-manual-title">Điều chỉnh vị trí thủ công</div>
                {[
                  { label: 'Khu nhập', value: manualZone, setter: (v: string) => { setManualZone(v); handleManualPositionChange(v, manualFloor); }, options: ['Zone A','Zone B','Zone C'] },
                  { label: 'Kho nhập', value: manualWarehouse, setter: setManualWH, options: ['Kho Khô','Kho Lạnh','Kho Hàng dễ vỡ','Kho khác'] },
                  { label: 'Tầng', value: manualFloor, setter: (v: string) => { setManualFloor(v); handleManualPositionChange(manualZone, v); }, options: ['1','2','3'] },
                ].map(({ label, value, setter, options }) => (
                  <div key={label} className="rp-field">
                    <label>{label}</label>
                    <div className="rp-select-wrap">
                      <select value={value} onChange={(e) => setter(e.target.value)}>
                        {options.map((o) => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
                <div className="rp-field">
                  <label>Vị trí</label>
                  <input type="text" value={manualPos}
                    onChange={(e) => setManualPos(e.target.value)} />
                </div>
                <button className="btn-primary rp-submit-btn" onClick={handleConfirmImport} disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Xác nhận nhập'}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────
type PanelMode = null | 'zone' | 'waiting-list' | 'import' | 'optimize';

export function Warehouse3D() {
  const [activeWH, setActiveWH]             = useState<WHType>('dry');
  const [panelMode, setPanelMode]           = useState<PanelMode>(null);

  // Phase 2: real occupancy stats from backend
  const { stats: WH_TABS, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const [selectedZone, setSelectedZone]     = useState<ZoneInfo | null>(null);
  const [selectedCode, setSelectedCode]     = useState<string | undefined>(undefined);
  const [selectedItem, setSelectedItem]     = useState<WaitingItem | undefined>(undefined);
  const [searchTerm, setSearchTerm]         = useState('');
  const [previewPosition, setPreviewPosition] = useState<PreviewPosition | null>(null);
  // Phase 8: source container highlight for optimization (amber glow in 3D)
  const [optimizeHighlight, setOptimizeHighlight] = useState<string | undefined>(undefined);
  const [isRefreshing, setIsRefreshing]           = useState(false);
  const [waitingRefreshKey, setWaitingRefreshKey] = useState(0);
  const sceneRef = useRef<SceneHandle>(null);

  function handleZoneClick(zone: ZoneInfo) {
    setSelectedZone(zone);
    setPanelMode('zone');
  }

  function closePanel() {
    setPanelMode(null);
    setSelectedZone(null);
    setSelectedCode(undefined);
    setSelectedItem(undefined);
    setPreviewPosition(null);
    setOptimizeHighlight(undefined);
  }

  function openWaiting() {
    setPanelMode('waiting-list');
    setSelectedZone(null);
  }

  function selectContainer(item: WaitingItem) {
    setSelectedCode(item.containerCode);
    setSelectedItem(item);
    setPanelMode('import');
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    try {
      const yards = await fetchAllYards();
      setYardData(processApiYards(yards));
      await fetchAndSetOccupancy(yards);
      refetchStats();
      if (panelMode === 'waiting-list') {
        setWaitingRefreshKey(k => k + 1);
      }
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="w3d-page">

        {/* ── Header ── */}
        <div className="w3d-header">
          <h1 className="w3d-title">Sơ đồ 3D kho bãi trực quan</h1>
          <p className="w3d-subtitle">Xem tổng quan kho bãi và đường đi container</p>
        </div>

        {/* ── Stat cards (Phase 2: real data from /admin/dashboard) ── */}
        <div className="w3d-stat-row" style={statsLoading ? { opacity: 0.6 } : undefined}>
          {statsError && (
            <p style={{ fontSize: '0.75rem', color: '#f87171', marginBottom: '0.25rem', width: '100%' }}>
              Không thể tải dữ liệu ({statsError})
            </p>
          )}
          {WH_TABS.map((wh) => <StatCard key={wh.id} wh={wh} />)}
        </div>

        {/* ── Action bar ── */}
        <div className="w3d-action-bar">
          {panelMode === null && (
            <button className="ctn-card" onClick={openWaiting}>
              <div className="ctn-card-icon"><Truck size={20} /></div>
              <div className="ctn-card-text">
                <span className="ctn-card-label">Container chờ nhập kho</span>
                <span className="ctn-card-sub">Xem danh sách chờ</span>
              </div>
              <ChevronRight size={17} className="ctn-card-chevron" />
            </button>
          )}
          <div className="w3d-spacer" />
          <div className="w3d-search">
            <Search size={15} className="w3d-search-icon" />
            <input type="text" placeholder="Nhập mã số Container..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="btn-primary w3d-import-btn" onClick={() => setPanelMode('import')}>
            <Plus size={17} /><span>Nhập/Xuất</span>
          </button>
          <button
            className={`w3d-import-btn ${panelMode === 'optimize' ? 'btn-primary' : ''}`}
            style={panelMode !== 'optimize' ? { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' } : undefined}
            onClick={() => setPanelMode(panelMode === 'optimize' ? null : 'optimize')}
            title="Tối ưu hóa vị trí container"
          >
            <Shuffle size={17} /><span>Tối ưu</span>
          </button>
          <button
            className="w3d-import-btn"
            style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={17} className={isRefreshing ? 'refresh-spinning' : ''} /><span>Làm mới</span>
          </button>
        </div>

        {/* ── Warehouse type tabs ── */}
        <div className="w3d-wh-tabs">
          {WH_TABS.map((wh) => (
            <button
              key={wh.id}
              className={`w3d-wh-tab ${activeWH === wh.id ? 'w3d-wh-tab-active' : ''}`}
              style={{ '--tab-color': wh.color } as React.CSSProperties}
              onClick={() => setActiveWH(wh.id)}
            >
              <WHIcon type={wh.id} size={15} />
              <span>{wh.name}</span>
            </button>
          ))}
        </div>

        {/* ── Content row: 3D canvas + right panel ── */}
        <div className="w3d-content-row">
          <div className="w3d-canvas-wrap">
            <WarehouseScene ref={sceneRef} warehouseType={activeWH} onZoneClick={handleZoneClick}
              highlightId={searchTerm.trim() || optimizeHighlight}
              previewPosition={previewPosition} />
            <div className="w3d-controls">
              <button className="ctrl-btn" aria-label="Zoom in"   onClick={() => sceneRef.current?.zoomIn()}>   <ZoomIn  size={18} /></button>
              <button className="ctrl-btn" aria-label="Zoom out"  onClick={() => sceneRef.current?.zoomOut()}>  <ZoomOut size={18} /></button>
              <button className="ctrl-btn ctrl-btn-primary" aria-label="Reset view" onClick={() => sceneRef.current?.resetView()}><Compass size={18} /></button>
            </div>
          </div>

          {panelMode === 'zone' && selectedZone && <ZoneInfoPanel zone={selectedZone} />}
          {panelMode === 'waiting-list' && (
            <WaitingListPanel onClose={closePanel} onSelect={selectContainer} refreshKey={waitingRefreshKey} />
          )}
          {panelMode === 'import' && (
            <ImportPanel onClose={closePanel} initialCode={selectedCode} initialItem={selectedItem} onPreviewChange={setPreviewPosition} />
          )}
          {/* Phase 8: Optimization panel — relocate & swap */}
          {panelMode === 'optimize' && (
            <OptimizationPanel
              panelClass="w3d-right-panel"
              warehouseType={activeWH}
              onClose={closePanel}
              onPreviewChange={setPreviewPosition}
              onSourceHighlight={setOptimizeHighlight}
            />
          )}
        </div>

        {/* ── Legend ── */}
        <div className="w3d-legend-row"><Legend /></div>
      </div>
    </DashboardLayout>
  );
}

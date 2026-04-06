/**
 * Phase 5 — Gate-In flow and position recommendation.
 *
 * fetchRecommendation(): POST /admin/optimization/recommend
 * confirmGateIn():
 *   Step 1 — POST /admin/gate-in           → get containerId
 *   Step 2 — POST /admin/containers/{id}/position → assign slot
 *   Step 3 — fetchAndSetOccupancy()        → refresh 3D grid
 */
import { apiFetch } from './apiClient';
import { getCachedYards } from './yardService';
import { fetchAndSetOccupancy } from './containerPositionService';
import type { SuggestedPosition } from '../data/containerStore';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = Record<string, any>;

// ─── WHType inference (same as yardStore / containerPositionService) ──────────

function inferWHType(yardType: string, yardName: string) {
  const t = (yardType ?? '').toLowerCase();
  const n = (yardName ?? '').toLowerCase();
  if (t === 'cold'    || n.includes('lạnh'))                    return 'cold' as const;
  if (t === 'dry'     || n.includes('khô'))                     return 'dry' as const;
  if (t === 'fragile' || n.includes('vỡ') || n.includes('dễ'))  return 'fragile' as const;
  return 'other' as const;
}

// ─── Occupancy refresh ────────────────────────────────────────────────────────

/** Re-fetches all IN_YARD containers and their positions to update the 3D grid. */
export async function refreshOccupancy(): Promise<void> {
  const yards = getCachedYards();
  if (yards.length > 0) {
    await fetchAndSetOccupancy(yards);
  }
}

// ─── Recommendation ───────────────────────────────────────────────────────────

/**
 * Calls POST /admin/optimization/recommend and maps the top-1 result to
 * SuggestedPosition so the existing UI card can display it without changes.
 */
export async function fetchRecommendation(
  cargoType:  string,
  weight:     string,
  sizeType:   '20ft' | '40ft',
): Promise<SuggestedPosition | null> {
  const grossWeight = parseFloat(weight) || 0;

  const res = await apiFetch('/admin/optimization/recommend', {
    method: 'POST',
    body: JSON.stringify({
      cargoTypeName:  cargoType,
      grossWeight,
      containerType:  sizeType,
    }),
  });

  if (!res.ok) throw new Error(`Gợi ý vị trí thất bại (HTTP ${res.status})`);

  const json: Rec    = await res.json();
  const wrapper: Rec = (json.data ?? json) as Rec;
  // Backend wraps slot list in PlacementRecommendation.recommendations
  const list: Rec[]  = Array.isArray(wrapper.recommendations)
    ? wrapper.recommendations
    : Array.isArray(wrapper) ? wrapper : [];
  if (list.length === 0) return null;

  // Take the top recommendation (highest score / first item)
  const top: Rec = list[0];

  const rowNo    = Number(top.rowNo   ?? top.row  ?? 1);
  const bayNo    = Number(top.bayNo   ?? top.bay  ?? top.col ?? 1);
  const tier     = Number(top.recommendedTier ?? top.tier ?? top.tierNo ?? top.floor ?? 1);
  const yardType = String(top.yardType ?? top.whType ?? top.type ?? '');
  const yardName = String(top.yardName ?? top.whName ?? top.yard ?? '');
  const zoneName = String(top.zoneName ?? top.zone ?? 'Zone A');

  return {
    whType:    inferWHType(yardType, yardName),
    whName:    yardName || cargoType,
    zone:      zoneName,
    floor:     tier,
    row:       rowNo - 1,   // convert to 0-based for scene
    col:       bayNo - 1,
    slot:      `R${rowNo}C${bayNo}`,
    sizeType,
    efficiency: Number(top.efficiency ?? top.finalScore ?? top.score ?? top.optimizationScore ?? 0) || 0,
    moves:      Number(top.moves ?? top.relocationsEstimated ?? top.relocations ?? 0),
    slotId:     top.slotId  != null ? Number(top.slotId)  : undefined,
    blockId:    top.blockId != null ? Number(top.blockId) : undefined,
  };
}

// ─── Yard ID resolver ────────────────────────────────────────────────────────

/**
 * Looks up the yardId from cached yards by exact yardName, falling back to
 * inferred WHType. Returns 0 if no match (caller should validate).
 */
export function resolveYardId(whName: string, whType: string): number {
  const yards = getCachedYards();
  const byName = yards.find((y) => y.yardName === whName);
  if (byName) return byName.yardId;
  const byType = yards.find((y) => inferWHType(y.yardType, y.yardName) === whType);
  return byType?.yardId ?? 0;
}

// ─── Gate-in params ───────────────────────────────────────────────────────────

export interface GateInParams {
  containerCode:      string;
  cargoType:          string;
  sizeType:           '20ft' | '40ft';
  weight:             string;
  exportDate:         string;
  priority:           string;
  yardId:             number;   // required — resolved from recommendation or zone selection
  slotId:             number;   // required — from recommendation (POST /admin/containers/{id}/position)
  tier:               number;   // 1-based (floor / recommendedTier)
  /** When true (container selected from waiting list), skip existence check/creation — container already exists. */
  skipContainerCheck?: boolean;
}

// ─── Gate-in 3-step flow ──────────────────────────────────────────────────────

/**
 * Correct 4-step gate-in flow:
 *  Step 1 — Ensure container exists in DB (create if 404)
 *  Step 2 — POST /admin/gate-in { containerId, yardId }
 *  Step 3 — POST /admin/containers/{containerId}/position { slotId, tier }
 *  Step 4 — refreshOccupancy() — updates 3D grid in all scenes
 *
 * Throws a descriptive Error string if any step fails.
 */
export async function confirmGateIn(params: GateInParams): Promise<void> {
  const containerCode = params.containerCode || `CTN-${Date.now()}`;

  if (!params.slotId) {
    throw new Error('Chưa có vị trí khả dụng — vui lòng lấy gợi ý vị trí trước khi xác nhận');
  }
  if (!params.yardId) {
    throw new Error('Không xác định được kho đích — vui lòng thử lại');
  }

  // ── Step 1: Ensure container exists (skip when coming from waiting list) ──────
  if (!params.skipContainerCheck) {
    const checkRes = await apiFetch(`/admin/containers/${encodeURIComponent(containerCode)}`);
    if (checkRes.status === 404) {
      // Container not registered yet — create it
      const createRes = await apiFetch('/admin/containers', {
        method: 'POST',
        body: JSON.stringify({
          containerId: containerCode,
          grossWeight: parseFloat(params.weight) || 0,
        }),
      });
      if (!createRes.ok) {
        const body = await createRes.text().catch(() => '');
        throw new Error(`Tạo container thất bại (HTTP ${createRes.status})${body ? ': ' + body : ''}`);
      }
    } else if (!checkRes.ok) {
      const body = await checkRes.text().catch(() => '');
      throw new Error(`Kiểm tra container thất bại (HTTP ${checkRes.status})${body ? ': ' + body : ''}`);
    }
  }

  // ── Step 2: Gate-in ───────────────────────────────────────────────────────────
  const gateInRes = await apiFetch('/admin/gate-in', {
    method: 'POST',
    body: JSON.stringify({
      containerId: containerCode,
      yardId:      params.yardId,
    }),
  });
  if (!gateInRes.ok) {
    const body = await gateInRes.text().catch(() => '');
    throw new Error(`Gate-in thất bại (HTTP ${gateInRes.status})${body ? ': ' + body : ''}`);
  }

  // Read the server-confirmed containerId from the gate-in receipt response.
  // The backend may normalise the ID (trim, uppercase, etc.) so always use
  // what it returns rather than the local containerCode variable.
  const gateInJson = await gateInRes.json().catch(() => ({})) as Rec;
  const gateInData = (gateInJson.data ?? gateInJson) as Rec;
  const confirmedContainerId = String(gateInData.containerId ?? containerCode);

  // ── Step 3: Assign position ───────────────────────────────────────────────────
  const posRes = await apiFetch(`/admin/containers/${encodeURIComponent(confirmedContainerId)}/position`, {
    method: 'POST',
    body: JSON.stringify({
      slotId: params.slotId,
      tier:   params.tier,
    }),
  });
  if (!posRes.ok) {
    const body = await posRes.text().catch(() => '');
    throw new Error(`Gán vị trí thất bại (HTTP ${posRes.status})${body ? ': ' + body : ''}`);
  }

  // ── Step 4: Refresh 3D grid ───────────────────────────────────────────────────
  await refreshOccupancy();
}

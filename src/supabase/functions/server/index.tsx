import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as bcrypt from "npm:bcryptjs";

const app = new Hono();

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

app.use('*', logger(console.log));
app.use("/*", cors({
  origin: "*",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
}));

// ============================================================
// BUCKETS
// ============================================================
const BUCKET_USERS      = 'hungthuy-users';
const BUCKET_CONTAINERS = 'hungthuy-containers';
const BUCKET_ACTIVITIES = 'hungthuy-activities';

const JWT_SECRET = 'HungThuyWarehouse2025SuperSecret!@#';

// ============================================================
// STORAGE HELPERS
// ============================================================
async function sBucketInit() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const names = (buckets || []).map((b: any) => b.name);
  for (const name of [BUCKET_USERS, BUCKET_CONTAINERS, BUCKET_ACTIVITIES]) {
    if (!names.includes(name)) {
      await supabase.storage.createBucket(name, { public: false });
    }
  }
}

async function sGet(bucket: string, key: string): Promise<any | null> {
  const { data, error } = await supabase.storage.from(bucket).download(`${key}.json`);
  if (error || !data) return null;
  return JSON.parse(await data.text());
}

async function sSet(bucket: string, key: string, value: any): Promise<void> {
  const blob = new Blob([JSON.stringify(value)], { type: 'application/json' });
  const { error } = await supabase.storage.from(bucket).upload(`${key}.json`, blob, { upsert: true });
  if (error) throw new Error(`sSet[${key}]: ${error.message}`);
}

async function sDel(bucket: string, key: string): Promise<void> {
  await supabase.storage.from(bucket).remove([`${key}.json`]);
}

async function sList(bucket: string): Promise<any[]> {
  const { data, error } = await supabase.storage.from(bucket).list('', { limit: 1000 });
  if (error || !data) return [];
  const results: any[] = [];
  for (const file of data) {
    if (!file.name.endsWith('.json')) continue;
    const { data: blob } = await supabase.storage.from(bucket).download(file.name);
    if (!blob) continue;
    try { results.push(JSON.parse(await blob.text())); } catch (_) { /**/ }
  }
  return results;
}

// ============================================================
// SIMPLE JWT (HMAC-SHA256) — dùng TextEncoder để hỗ trợ Unicode
// ============================================================
function b64url(data: Uint8Array | string): string {
  let bytes: Uint8Array;
  if (typeof data === 'string') {
    bytes = new TextEncoder().encode(data);
  } else {
    bytes = data;
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(s: string): string {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(s.length + (4 - s.length % 4) % 4, '=');
  const binary = atob(padded);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function signJWT(payload: object): Promise<string> {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body   = b64url(JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + 86400000 * 7 }));
  const data   = `${header}.${body}`;
  const key    = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig    = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return `${data}.${b64url(new Uint8Array(sig))}`;
}

async function verifyJWT(token: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const data = `${header}.${body}`;
    const key  = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const sigPadded  = sig.replace(/-/g, '+').replace(/_/g, '/').padEnd(sig.length + (4 - sig.length % 4) % 4, '=');
    const sigBytes   = Uint8Array.from(atob(sigPadded), c => c.charCodeAt(0));
    const valid      = await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(data));
    if (!valid) return null;
    const payload    = JSON.parse(b64urlDecode(body));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// ============================================================
// MIDDLEWARE XÁC THỰC
// ============================================================
async function authMiddleware(c: any, next: any) {
  const token = c.req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return c.json({ error: 'Thiếu token xác thực' }, 401);
  const payload = await verifyJWT(token);
  if (!payload) return c.json({ error: 'Token không hợp lệ hoặc hết hạn' }, 401);
  c.set('authUser', payload);
  await next();
}

function requireRole(...roles: string[]) {
  return async (c: any, next: any) => {
    const u = c.get('authUser');
    if (!roles.includes(u?.role)) return c.json({ error: 'Không đủ quyền truy cập' }, 403);
    await next();
  };
}

// ============================================================
// PRE-SEED DEMO ACCOUNTS (chạy khi server khởi động)
// ============================================================
const DEMO_USERS = [
  { id: 'u-admin',    email: 'admin@hungthuy.com',    password: 'Hungthuy@2025', name: 'Nguyễn Hùng Thủy', role: 'admin',    company: 'Hùng Thủy Transport', phone: '0901234567' },
  { id: 'u-planner',  email: 'planner@hungthuy.com',  password: 'Hungthuy@2025', name: 'Trần Minh Phúc',   role: 'planner',  company: 'Hùng Thủy Transport', phone: '0902345678' },
  { id: 'u-operator', email: 'operator@hungthuy.com', password: 'Hungthuy@2025', name: 'Lê Văn Hùng',      role: 'operator', company: 'Hùng Thủy Transport', phone: '0903456789' },
  { id: 'u-customer', email: 'customer@hungthuy.com', password: 'Hungthuy@2025', name: 'Phạm Thị Lan',     role: 'customer', company: 'Công ty XNK ABC',     phone: '0904567890' },
];

const DEMO_CONTAINERS = [
  { container_number: 'TEMU1234567', container_type: '40ft',    cargo_type: 'Điện tử',              weight_kg: 24000, zone: 'A', block: '01', slot: '015', status: 'in_storage', eta: '2026-03-01', etd: '2026-03-15', customer_name: 'Công ty XNK Việt Nam',     customer_id: 'u-customer' },
  { container_number: 'CSNU9876543', container_type: '20ft',    cargo_type: 'Hàng dệt may',         weight_kg: 18000, zone: 'A', block: '02', slot: '008', status: 'in_storage', eta: '2026-03-02', etd: '2026-03-20', customer_name: 'Tập đoàn Dệt May ABC',     customer_id: 'u-customer' },
  { container_number: 'HLXU2468135', container_type: '40ft-hc', cargo_type: 'Thực phẩm đông lạnh', weight_kg: 26000, zone: 'B', block: '01', slot: '003', status: 'pending',    eta: '2026-03-05', etd: '2026-03-25', customer_name: 'Cty Thực phẩm XYZ',        customer_id: 'u-customer' },
  { container_number: 'MSCU5671234', container_type: '20ft',    cargo_type: 'Nông sản',             weight_kg: 15000, zone: 'B', block: '03', slot: '012', status: 'exported',   eta: '2026-02-20', etd: '2026-03-01', customer_name: 'HTX Nông sản Miền Nam',    customer_id: '' },
  { container_number: 'CMAU7891011', container_type: '40ft',    cargo_type: 'Hóa chất công nghiệp',weight_kg: 22000, zone: 'C', block: '01', slot: '007', status: 'in_storage', eta: '2026-03-03', etd: '2026-03-18', customer_name: 'Cty Hóa chất Phương Đông', customer_id: '' },
  { container_number: 'OOLU3344556', container_type: '20ft',    cargo_type: 'Máy móc thiết bị',     weight_kg: 19000, zone: 'C', block: '02', slot: '004', status: 'pending',    eta: '2026-03-06', etd: '2026-03-28', customer_name: 'Cty Cơ khí Thiên Long',    customer_id: '' },
  { container_number: 'EVERGREEN77', container_type: '40ft-hc', cargo_type: 'Hàng lạnh',           weight_kg: 27000, zone: 'D', block: '01', slot: '001', status: 'in_storage', eta: '2026-03-04', etd: '2026-03-22', customer_name: 'Siêu thị Vinmart',         customer_id: '' },
];

async function autoSeedOnStartup() {
  try {
    await sBucketInit();

    // ── Seed users ────────────────────────────────────────────────
    for (const u of DEMO_USERS) {
      const existing = await sGet(BUCKET_USERS, u.id);
      if (!existing) {
        const hash = await bcrypt.hash(u.password, 10);
        await sSet(BUCKET_USERS, u.id, {
          id: u.id, email: u.email, name: u.name, role: u.role,
          company: u.company, phone: u.phone,
          password_hash: hash,
          created_at: new Date().toISOString(),
          status: 'active',
        });
        console.log(`✅ Seeded user: ${u.email}`);
      }
    }

    // ── Seed containers ───────────────────────────────────────────
    const existing = await sList(BUCKET_CONTAINERS);
    if (existing.length === 0) {
      const now = new Date().toISOString();
      for (const c of DEMO_CONTAINERS) {
        const id = crypto.randomUUID();
        await sSet(BUCKET_CONTAINERS, id, {
          id, ...c, notes: '',
          position: `${c.zone}-${c.block}-${c.slot}`,
          created_by: 'u-admin', created_by_name: 'Nguyễn Hùng Thủy',
          created_at: now, updated_at: now,
        });
      }
      console.log(`✅ Seeded ${DEMO_CONTAINERS.length} containers`);
    }

    console.log('🚀 Hùng Thủy server ready — database pre-seeded');
  } catch (e) {
    console.error('Startup seed error:', e);
  }
}

autoSeedOnStartup();

// ============================================================
// HEALTH
// ============================================================
app.get('/make-server-ce1eb60c/health', (c) =>
  c.json({ status: 'ok', service: 'Hùng Thủy Warehouse API', version: '2.0' })
);

// ============================================================
// AUTH — ĐĂNG NHẬP (so sánh với database)
// ============================================================
app.post('/make-server-ce1eb60c/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ error: 'Email và mật khẩu là bắt buộc' }, 400);

    // Tìm user theo email trong tất cả users
    const allUsers = await sList(BUCKET_USERS);
    const user = allUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase().trim());

    if (!user) return c.json({ error: 'Email không tồn tại trong hệ thống' }, 401);
    if (user.status === 'inactive') return c.json({ error: 'Tài khoản đã bị khóa' }, 403);

    // So sánh mật khẩu
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return c.json({ error: 'Mật khẩu không đúng' }, 401);

    // Tạo JWT
    const token = await signJWT({
      id: user.id, email: user.email, name: user.name,
      role: user.role, company: user.company, phone: user.phone,
    });

    // Ghi nhật ký đăng nhập
    const logId = crypto.randomUUID();
    await sSet(BUCKET_ACTIVITIES, logId, {
      id: logId, user_id: user.id, user_name: user.name,
      action_type: 'login', entity_type: 'auth', entity_id: user.id,
      description: `${user.name} (${user.role}) đăng nhập hệ thống`,
      created_at: new Date().toISOString(),
    });

    return c.json({
      token,
      user: {
        id: user.id, email: user.email, name: user.name,
        role: user.role, company: user.company, phone: user.phone,
      }
    });
  } catch (e: any) {
    console.error('Login error:', e);
    return c.json({ error: 'Lỗi server: ' + e.message }, 500);
  }
});

// ============================================================
// AUTH — ĐĂNG KÝ
// ============================================================
app.post('/make-server-ce1eb60c/auth/register', async (c) => {
  try {
    const { email, password, name, company, phone } = await c.req.json();
    if (!email || !password || !name) return c.json({ error: 'Email, mật khẩu và họ tên là bắt buộc' }, 400);
    if (password.length < 6) return c.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, 400);

    const allUsers = await sList(BUCKET_USERS);
    if (allUsers.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())) {
      return c.json({ error: 'Email này đã được đăng ký' }, 400);
    }

    const id   = `u-${crypto.randomUUID()}`;
    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      id, email: email.toLowerCase(), name, company: company || '', phone: phone || '',
      role: 'customer', password_hash: hash,
      status: 'active', created_at: new Date().toISOString(),
    };
    await sSet(BUCKET_USERS, id, newUser);
    console.log(`✅ Registered new user: ${email}`);
    return c.json({ message: 'Đăng ký thành công', user: { id, email, name, role: 'customer' } });
  } catch (e: any) {
    return c.json({ error: 'Lỗi đăng ký: ' + e.message }, 500);
  }
});

// ============================================================
// AUTH — XEM THÔNG TIN BẢN THÂN
// ============================================================
app.get('/make-server-ce1eb60c/auth/me', authMiddleware, async (c) => {
  const u = c.get('authUser');
  return c.json({ id: u.id, email: u.email, name: u.name, role: u.role, company: u.company, phone: u.phone });
});

// ============================================================
// CONTAINERS — DANH SÁCH
// ============================================================
app.get('/make-server-ce1eb60c/containers', authMiddleware, requireRole('admin', 'planner', 'operator'), async (c) => {
  try {
    const containers = (await sList(BUCKET_CONTAINERS))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ containers });
  } catch (e: any) {
    return c.json({ error: 'Lỗi lấy container: ' + e.message }, 500);
  }
});

app.get('/make-server-ce1eb60c/containers/my', authMiddleware, async (c) => {
  try {
    const u = c.get('authUser');
    const all = await sList(BUCKET_CONTAINERS);
    const containers = all
      .filter((c: any) => c.customer_id === u.id)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return c.json({ containers });
  } catch (e: any) {
    return c.json({ error: 'Lỗi: ' + e.message }, 500);
  }
});

// ============================================================
// CONTAINERS — THÊM MỚI
// ============================================================
app.post('/make-server-ce1eb60c/containers', authMiddleware, requireRole('admin', 'planner'), async (c) => {
  try {
    const u    = c.get('authUser');
    const body = await c.req.json();
    if (!body.container_number || !body.container_type) {
      return c.json({ error: 'Mã container và loại là bắt buộc' }, 400);
    }
    const all = await sList(BUCKET_CONTAINERS);
    if (all.find((x: any) => x.container_number === body.container_number)) {
      return c.json({ error: 'Mã container đã tồn tại' }, 400);
    }
    const id  = crypto.randomUUID();
    const now = new Date().toISOString();
    const container = {
      id, ...body,
      position: `${body.zone || 'A'}-${body.block || '01'}-${body.slot || '001'}`,
      created_by: u.id, created_by_name: u.name,
      created_at: now, updated_at: now,
    };
    await sSet(BUCKET_CONTAINERS, id, container);
    const logId = crypto.randomUUID();
    await sSet(BUCKET_ACTIVITIES, logId, {
      id: logId, user_id: u.id, user_name: u.name, action_type: 'create',
      entity_type: 'container', entity_id: body.container_number,
      description: `Thêm container ${body.container_number}`,
      created_at: now,
    });
    return c.json({ container, message: 'Thêm container thành công' });
  } catch (e: any) {
    return c.json({ error: 'Lỗi thêm container: ' + e.message }, 500);
  }
});

// ============================================================
// CONTAINERS — CẬP NHẬT
// ============================================================
app.put('/make-server-ce1eb60c/containers/:id', authMiddleware, requireRole('admin', 'planner'), async (c) => {
  try {
    const id   = c.req.param('id');
    const u    = c.get('authUser');
    const body = await c.req.json();
    const ex   = await sGet(BUCKET_CONTAINERS, id);
    if (!ex) return c.json({ error: 'Không tìm thấy container' }, 404);
    const updated = {
      ...ex, ...body,
      position: `${body.zone || ex.zone}-${body.block || ex.block}-${body.slot || ex.slot}`,
      updated_at: new Date().toISOString(),
    };
    await sSet(BUCKET_CONTAINERS, id, updated);
    const logId = crypto.randomUUID();
    await sSet(BUCKET_ACTIVITIES, logId, {
      id: logId, user_id: u.id, user_name: u.name, action_type: 'update',
      entity_type: 'container', entity_id: ex.container_number,
      description: `Cập nhật container ${ex.container_number}`,
      created_at: new Date().toISOString(),
    });
    return c.json({ container: updated, message: 'Cập nhật thành công' });
  } catch (e: any) {
    return c.json({ error: 'Lỗi cập nhật: ' + e.message }, 500);
  }
});

// ============================================================
// CONTAINERS — CẬP NHẬT TRẠNG THÁI
// ============================================================
app.patch('/make-server-ce1eb60c/containers/:id/status', authMiddleware, requireRole('admin', 'planner', 'operator'), async (c) => {
  try {
    const id = c.req.param('id');
    const u  = c.get('authUser');
    const { status } = await c.req.json();
    if (u.role === 'operator' && status !== 'exported') {
      return c.json({ error: 'Operator chỉ được đánh dấu "Đã xuất"' }, 403);
    }
    const ex = await sGet(BUCKET_CONTAINERS, id);
    if (!ex) return c.json({ error: 'Không tìm thấy container' }, 404);
    const now     = new Date().toISOString();
    const updated = { ...ex, status, updated_at: now, ...(status === 'exported' ? { export_date: now } : {}) };
    await sSet(BUCKET_CONTAINERS, id, updated);
    const logId = crypto.randomUUID();
    await sSet(BUCKET_ACTIVITIES, logId, {
      id: logId, user_id: u.id, user_name: u.name, action_type: 'status_change',
      entity_type: 'container', entity_id: ex.container_number,
      description: `Đổi trạng thái ${ex.container_number} → ${status}`,
      created_at: now,
    });
    return c.json({ container: updated, message: 'Cập nhật trạng thái thành công' });
  } catch (e: any) {
    return c.json({ error: 'Lỗi: ' + e.message }, 500);
  }
});

// ============================================================
// CONTAINERS — XÓA
// ============================================================
app.delete('/make-server-ce1eb60c/containers/:id', authMiddleware, requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const u  = c.get('authUser');
    const ex = await sGet(BUCKET_CONTAINERS, id);
    if (!ex) return c.json({ error: 'Không tìm thấy container' }, 404);
    await sDel(BUCKET_CONTAINERS, id);
    const logId = crypto.randomUUID();
    await sSet(BUCKET_ACTIVITIES, logId, {
      id: logId, user_id: u.id, user_name: u.name, action_type: 'delete',
      entity_type: 'container', entity_id: ex.container_number,
      description: `Xóa container ${ex.container_number}`,
      created_at: new Date().toISOString(),
    });
    return c.json({ message: 'Xóa thành công' });
  } catch (e: any) {
    return c.json({ error: 'Lỗi xóa: ' + e.message }, 500);
  }
});

// ============================================================
// DASHBOARD STATS
// ============================================================
app.get('/make-server-ce1eb60c/dashboard/stats', authMiddleware, requireRole('admin', 'planner', 'operator'), async (c) => {
  try {
    const containers  = await sList(BUCKET_CONTAINERS);
    const activities  = (await sList(BUCKET_ACTIVITIES))
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);
    return c.json({
      stats: {
        total:      containers.length,
        pending:    containers.filter((c: any) => c.status === 'pending').length,
        in_storage: containers.filter((c: any) => c.status === 'in_storage').length,
        exported:   containers.filter((c: any) => c.status === 'exported').length,
        by_type: containers.reduce((acc: any, c: any) => { acc[c.container_type] = (acc[c.container_type] || 0) + 1; return acc; }, {}),
        by_zone: containers.reduce((acc: any, c: any) => { acc[c.zone || 'A'] = (acc[c.zone || 'A'] || 0) + 1; return acc; }, {}),
      },
      activities,
    });
  } catch (e: any) {
    return c.json({ error: 'Lỗi thống kê: ' + e.message }, 500);
  }
});

// ============================================================
// USER MANAGEMENT (Admin only)
// ============================================================
app.get('/make-server-ce1eb60c/users', authMiddleware, requireRole('admin'), async (c) => {
  try {
    const users = (await sList(BUCKET_USERS)).map((u: any) => ({
      id: u.id, email: u.email, name: u.name, role: u.role,
      company: u.company, phone: u.phone, status: u.status, created_at: u.created_at,
    }));
    return c.json({ users });
  } catch (e: any) {
    return c.json({ error: 'Lỗi: ' + e.message }, 500);
  }
});

app.patch('/make-server-ce1eb60c/users/:id/role', authMiddleware, requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const { role } = await c.req.json();
    if (!['admin', 'planner', 'operator', 'customer'].includes(role)) {
      return c.json({ error: 'Vai trò không hợp lệ' }, 400);
    }
    const user = await sGet(BUCKET_USERS, id);
    if (!user) return c.json({ error: 'Không tìm thấy người dùng' }, 404);
    await sSet(BUCKET_USERS, id, { ...user, role });
    return c.json({ message: 'Cập nhật vai trò thành công' });
  } catch (e: any) {
    return c.json({ error: 'Lỗi: ' + e.message }, 500);
  }
});

app.patch('/make-server-ce1eb60c/users/:id/status', authMiddleware, requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const me = c.get('authUser');
    const { status } = await c.req.json();
    if (id === me.id) return c.json({ error: 'Không thể khóa tài khoản chính mình' }, 400);
    const user = await sGet(BUCKET_USERS, id);
    if (!user) return c.json({ error: 'Không tìm thấy người dùng' }, 404);
    await sSet(BUCKET_USERS, id, { ...user, status });
    return c.json({ message: `Tài khoản đã ${status === 'active' ? 'kích hoạt' : 'khóa'}` });
  } catch (e: any) {
    return c.json({ error: 'Lỗi: ' + e.message }, 500);
  }
});

app.delete('/make-server-ce1eb60c/users/:id', authMiddleware, requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const me = c.get('authUser');
    if (id === me.id) return c.json({ error: 'Không thể xóa tài khoản chính mình' }, 400);
    if (['u-admin', 'u-planner', 'u-operator', 'u-customer'].includes(id)) {
      return c.json({ error: 'Không thể xóa tài khoản demo mặc định' }, 400);
    }
    const user = await sGet(BUCKET_USERS, id);
    if (!user) return c.json({ error: 'Không tìm thấy người dùng' }, 404);
    await sDel(BUCKET_USERS, id);
    return c.json({ message: 'Xóa người dùng thành công' });
  } catch (e: any) {
    return c.json({ error: 'Lỗi: ' + e.message }, 500);
  }
});

// ============================================================
// LEGACY SEED ENDPOINT (vẫn giữ để tương thích)
// ============================================================
app.post('/make-server-ce1eb60c/seed-demo-users', async (c) => {
  await autoSeedOnStartup();
  return c.json({ message: 'Seed hoàn tất', results: DEMO_USERS.map(u => ({ email: u.email, status: 'ok' })) });
});

Deno.serve(app.fetch);
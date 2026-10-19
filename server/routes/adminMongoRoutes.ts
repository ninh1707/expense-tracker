/**
 * Admin endpoints for the MongoDB backend. Mounted after authenticateToken and
 * requireAdmin in adminRoutes.ts. Collections use the same names as the existing
 * Mongo repositories; no JSON Store files are accessed by this module.
 */
import { randomUUID } from 'node:crypto';
import { Router, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

const router = Router();

// Các schema Mongoose của dự án lưu _id dưới dạng string, không phải ObjectId.
// Khai báo _id rõ ràng để bộ lọc MongoDB nhận đúng kiểu khóa chính.
type Doc = { _id: string; [key: string]: any };
type Handler = (req: AuthenticatedRequest, res: Response) => Promise<void>;
const run = (handler: Handler) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  Promise.resolve().then(() => handler(req, res)).catch(next);
};
const database = () => {
  if (!mongoose.connection.db || mongoose.connection.readyState !== 1) {
    throw Object.assign(new Error('Không thể truy cập MongoDB. Vui lòng kiểm tra kết nối.'), { status: 503 });
  }
  return mongoose.connection.db;
};
const users = () => database().collection<Doc>('users');
const transactions = () => database().collection<Doc>('transactions');
const categories = () => database().collection<Doc>('globalCategories');
const logs = () => database().collection<Doc>('activityLogs');
const id = () => `id_${randomUUID()}`;
const normalized = (text: unknown) => String(text ?? '').normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
const safe = (u: Doc) => ({
  _id: u._id, name: u.name, email: u.email, role: u.role || 'user',
  disabled: !!u.disabled, createdAt: u.createdAt,
});
const audit = async (actorId: string, action: string, target: string, targetType: 'user' | 'category' = 'user') => {
  const [actor, item] = await Promise.all([
    users().findOne({ _id: actorId }, { projection: { name: 1, email: 1 } }),
    targetType === 'user'
      ? users().findOne({ _id: target }, { projection: { name: 1, email: 1 } })
      : categories().findOne({ _id: target }, { projection: { name: 1 } }),
  ]);
  await logs().insertOne({ _id: id(), actorId, actorName: actor?.name, actorEmail: actor?.email,
    action, target, targetType, targetName: item?.name, targetEmail: targetType === 'user' ? item?.email : undefined,
    createdAt: new Date().toISOString() });
};
const names: Record<string, string> = {
  food: 'Ăn uống', bills: 'Hóa đơn và tiện ích', shopping: 'Mua sắm',
  transport: 'Di chuyển', salary: 'Lương', entertainment: 'Giải trí',
  health: 'Sức khỏe', education: 'Giáo dục', savings: 'Tiết kiệm',
  freelance: 'Làm việc tự do', investment: 'Đầu tư',
};
const builtins = [
  ['food', 'Ăn uống & Cà phê', 'expense'],
  ['shopping', 'Mua sắm cá nhân', 'expense'],
  ['transport', 'Đi lại & Xăng xe', 'expense'],
  ['bills', 'Hóa đơn & Tiện ích', 'expense'],
  ['entertainment', 'Giải trí & Phim ảnh', 'expense'],
  ['education', 'Giáo dục & Học tập', 'expense'],
  ['health', 'Y tế & Sức khỏe', 'expense'],
  ['housing', 'Nhà cửa & Nội thất', 'expense'],
  ['salary', 'Lương & Thưởng', 'income'],
  ['freelance', 'Thu nhập thêm', 'income'],
  ['investment', 'Đầu tư & Lãi suất', 'income'],
  ['savings', 'Tích lũy & Tiết kiệm', 'expense'],
  ['savings', 'Tích lũy & Tiết kiệm', 'income'],
  ['other', 'Khoản thu chi khác', 'expense'],
  ['other', 'Khoản thu chi khác', 'income'],
] as const;

// Used by ordinary logged-in users; don't require admin privileges.
export const activeMongoCategories = run(async (_req, res) => {
  const custom = await categories().find({}).toArray();
  const items: Doc[] = [];
  for (const [categoryId, displayName, type] of builtins) {
    const overrides = custom.filter(c => c.type === type &&
      (c._id === categoryId || normalized(c.name) === normalized(displayName) || normalized(c.name) === normalized(categoryId)));
    if (overrides.some(c => c.active === false)) continue;
    const replacement = overrides.find(c => c.active !== false);
    items.push({ _id: categoryId, name: replacement?.name || displayName, type, active: true });
  }
  for (const c of custom) {
    if (c.active === false || !['income', 'expense'].includes(c.type)) continue;
    if (items.some(x => x.type === c.type && (normalized(x.name) === normalized(c.name) || x._id === c._id))) continue;
    items.push({ _id: c._id, name: c.name, type: c.type, active: true });
  }
  res.json({ items });
});

router.get('/users', run(async (_req, res) => {
  const [items, total] = await Promise.all([
    users().find({}, { projection: { password: 0 } }).sort({ createdAt: -1 }).toArray(),
    users().countDocuments(),
  ]);
  res.json({ items: items.map(safe), total });
}));

// Serializes admin privilege changes inside this local server process, preventing
// concurrent operations from removing the last active admin at the same time.
let lastMutation: Promise<void> = Promise.resolve();
const exclusive = async (fn: () => Promise<void>) => {
  const before = lastMutation;
  let release!: () => void;
  lastMutation = new Promise<void>(resolve => { release = resolve; });
  await before;
  try { await fn(); } finally { release(); }
};

const patchUser = async (req: AuthenticatedRequest, res: Response, lockOnly = false) => {
  await exclusive(async () => {
    const userId = String(req.params.id || '');
    const account = await users().findOne({ _id: userId });
    if (!account) { res.status(404).json({ message: 'Không tìm thấy người dùng.' }); return; }
    const body = lockOnly ? { disabled: true } : req.body || {};
    const update: Partial<Doc> = {};
    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length < 2 || body.name.length > 100) {
        res.status(400).json({ message: 'Tên người dùng phải có 2–100 ký tự.' }); return;
      }
      update.name = body.name.trim();
    }
    if (body.role !== undefined) {
      if (!['user', 'admin'].includes(body.role)) {
        res.status(400).json({ message: 'Quyền người dùng không hợp lệ.' }); return;
      }
      update.role = body.role;
    }
    if (body.disabled !== undefined) {
      if (typeof body.disabled !== 'boolean') {
        res.status(400).json({ message: 'Trạng thái khóa tài khoản không hợp lệ.' }); return;
      }
      update.disabled = body.disabled;
    }
    if (!Object.keys(update).length) {
      res.status(400).json({ message: 'Không có trường hợp lệ cần cập nhật.' }); return;
    }
    if (userId === req.user!.userId && (update.role === 'user' || update.disabled === true)) {
      res.status(400).json({ message: 'Không được tự hạ quyền hoặc khóa tài khoản.' }); return;
    }
    if (account.role === 'admin' && account.disabled !== true && (update.role === 'user' || update.disabled === true)) {
      const admins = await users().countDocuments({ role: 'admin', disabled: { $ne: true } });
      if (admins <= 1) {
        res.status(400).json({ message: 'Phải giữ ít nhất một quản trị viên đang hoạt động.' }); return;
      }
    }
    update.updatedAt = new Date().toISOString();
    if (update.disabled === true) update.deletedAt = update.updatedAt;
    if (update.disabled === false) update.deletedAt = null;
    const result = await users().updateOne({ _id: userId }, { $set: update });
    if (!result.matchedCount) { res.status(404).json({ message: 'Không tìm thấy người dùng.' }); return; }
    await audit(req.user!.userId, lockOnly ? 'KHÓA NGƯỜI DÙNG' : 'CẬP NHẬT NGƯỜI DÙNG', userId);
    res.json({ success: true });
  });
};
router.patch('/users/:id', run(async (req, res) => patchUser(req, res)));
router.delete('/users/:id', run(async (req, res) => patchUser(req, res, true)));

router.get('/stats', run(async (_req, res) => {
  const [activeUsers, txCount, amountRows] = await Promise.all([
    users().countDocuments({ disabled: { $ne: true } }),
    transactions().countDocuments(),
    transactions().aggregate<Doc>([
      { $match: { type: { $in: ['income', 'expense'] } } },
      { $group: { _id: '$type', total: { $sum: { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } } } } },
    ]).toArray(),
  ]);
  const income = amountRows.find(x => x._id === 'income')?.total || 0;
  const expense = amountRows.find(x => x._id === 'expense')?.total || 0;
  res.json({ users: activeUsers, transactions: txCount, income, expense });
}));

const transactionCategorySummary = async () => transactions().aggregate<{ _id: { type: string; category: string }; transactionCount: number; totalAmount: number }>([
  { $match: { type: { $in: ['income', 'expense'] } } },
  { $group: {
    _id: { type: '$type', category: '$category' },
    transactionCount: { $sum: 1 },
    totalAmount: { $sum: { $convert: { input: '$amount', to: 'double', onError: 0, onNull: 0 } } },
  } },
]).toArray();

router.get('/categories', run(async (_req, res) => {
  const [custom, txGroups] = await Promise.all([categories().find({}).toArray(), transactionCategorySummary()]);
  const base: Doc[] = custom.map(c => ({ ...c, transactionCount: 0, totalAmount: 0 }));
  const found: Doc[] = [];
  for (const t of txGroups) {
    const category = String(t._id?.category ?? '');
    const type = t._id?.type;
    const canonical = String(names[category] || category || 'Không phân loại').trim();
    const key = normalized(canonical) + '|' + type;
    let target = base.find(c => normalized(c.name) + '|' + c.type === key);
    if (!target) {
      target = found.find(c => c._key === key);
      if (!target) {
        target = { _id: 'detected_' + encodeURIComponent(key), _key: key,
          name: canonical, type, active: true, detected: true, transactionCount: 0, totalAmount: 0 };
        found.push(target);
      }
    }
    target.transactionCount += t.transactionCount || 0;
    target.totalAmount += t.totalAmount || 0;
  }
  res.json({ items: [...base, ...found].map(({ _key, ...c }) => c) });
}));

router.post('/categories', run(async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const type = req.body?.type;
  if (name.length < 2 || name.length > 80 || !['income', 'expense'].includes(type)) {
    res.status(400).json({ message: 'Danh mục không hợp lệ.' }); return;
  }
  // Name collision check against real transactions, mirroring the existing JSON backend.
  const [custom, txGroups] = await Promise.all([categories().find({ type }).toArray(), transactionCategorySummary()]);
  if (txGroups.some(t => t._id?.type === type &&
      normalized(names[String(t._id?.category)] || t._id?.category) === normalized(name))) {
    res.status(409).json({ message: 'Danh mục đã có trong giao dịch cũ. Hãy sử dụng danh mục đã phát hiện.' }); return;
  }
  if (custom.some(c => c.active !== false && normalized(c.name) === normalized(name))) {
    res.status(409).json({ message: 'Danh mục đã tồn tại.' }); return;
  }
  const category = { _id: id(), name, type, active: true };
  await categories().insertOne(category);
  await audit(req.user!.userId, 'THÊM DANH MỤC', category._id, 'category');
  res.status(201).json({ id: category._id });
}));

router.patch('/categories/:id', run(async (req, res) => {
  const categoryId = String(req.params.id || '');
  const current = await categories().findOne({ _id: categoryId });
  if (!current) { res.status(404).json({ message: 'Không có danh mục.' }); return; }
  const name = req.body?.name === undefined ? current.name : req.body?.name;
  const active = req.body?.active === undefined ? current.active : req.body?.active;
  if (typeof name !== 'string' || name.trim().length < 2 || name.length > 80 || typeof active !== 'boolean') {
    res.status(400).json({ message: 'Tên hoặc trạng thái danh mục không hợp lệ.' }); return;
  }
  if (active && (await categories().find({ type: current.type, active: { $ne: false }, _id: { $ne: categoryId } }).toArray())
    .some(c => normalized(c.name) === normalized(name))) {
    res.status(409).json({ message: 'Danh mục đang sử dụng có tên trùng.' }); return;
  }
  await categories().updateOne({ _id: categoryId }, { $set: { name: name.trim(), active } });
  await audit(req.user!.userId, 'SỬA DANH MỤC', categoryId, 'category');
  res.json({ success: true });
}));

router.delete('/categories/:id', run(async (req, res) => {
  const categoryId = String(req.params.id || '');
  const result = await categories().updateOne({ _id: categoryId }, { $set: { active: false } });
  if (!result.matchedCount) { res.status(404).json({ message: 'Không có danh mục.' }); return; }
  await audit(req.user!.userId, 'NGỪNG DANH MỤC', categoryId, 'category');
  res.json({ success: true });
}));

router.get('/logs', run(async (_req, res) => {
  const items = await logs().find({}).sort({ createdAt: -1 }).limit(200).toArray();
  // Bản ghi trước khi bổ sung snapshot chỉ có actorId và target. Tra cứu theo
  // _id trong users/globalCategories mà không sửa nhật ký cũ trong database.
  const userIds = new Set<string>();
  const categoryIds = new Set<string>();
  for (const entry of items) {
    if (typeof entry.actorId === 'string' && entry.actorId) userIds.add(entry.actorId);
    if (typeof entry.target !== 'string' || !entry.target) continue;
    const isCategory = entry.targetType === 'category' || String(entry.action).includes('DANH MỤC');
    if (isCategory) categoryIds.add(entry.target);
    else userIds.add(entry.target);
  }
  const [userDocs, categoryDocs] = await Promise.all([
    userIds.size ? users().find({ _id: { $in: [...userIds] } }, { projection: { _id: 1, name: 1, email: 1 } }).toArray() : Promise.resolve([] as Doc[]),
    categoryIds.size ? categories().find({ _id: { $in: [...categoryIds] } }, { projection: { _id: 1, name: 1 } }).toArray() : Promise.resolve([] as Doc[]),
  ]);
  const byUser = new Map(userDocs.map(u => [u._id, u]));
  const byCategory = new Map(categoryDocs.map(c => [c._id, c]));
  const enriched = items.map(entry => {
    const isCategory = entry.targetType === 'category' || String(entry.action).includes('DANH MỤC');
    const target = isCategory ? byCategory.get(entry.target) : byUser.get(entry.target);
    const actor = byUser.get(entry.actorId);
    return {
      ...entry,
      targetType: isCategory ? 'category' : 'user',
      targetName: entry.targetName || target?.name || undefined,
      targetEmail: entry.targetEmail || (!isCategory ? target?.email : undefined),
      actorName: entry.actorName || actor?.name || undefined,
      actorEmail: entry.actorEmail || actor?.email || undefined,
    };
  });
  res.json({ items: enriched });
}));

export default router;

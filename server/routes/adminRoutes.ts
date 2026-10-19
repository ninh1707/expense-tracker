import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middlewares/authMiddleware';
import { UserModel } from '../models/User';
import { loadData, saveData, isUsingMongo } from '../config/db';
import mongoAdminRouter, { activeMongoCategories } from './adminMongoRoutes';
const router = Router();
router.use(authenticateToken as any);
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const account = await UserModel.findById(req.user!.userId);
    if (!account || account.disabled || account.role !== 'admin') {
      res.status(403).json({ message: 'Không có quyền quản trị.' });
      return;
    }
    next();
  } catch (error) { next(error); }
};
// Người dùng đã đăng nhập được phép xem danh mục đang kích hoạt.
router.get('/categories/active', (req,res,next)=>{
 if (isUsingMongo()) return activeMongoCategories(req, res, next);
 const d = loadData();
 const builtins = [
  ['food','Ăn uống & Cà phê','expense'],['shopping','Mua sắm cá nhân','expense'],
  ['transport','Đi lại & Xăng xe','expense'],['bills','Hóa đơn & Tiện ích','expense'],
  ['entertainment','Giải trí & Phim ảnh','expense'],['education','Giáo dục & Học tập','expense'],
  ['health','Y tế & Sức khỏe','expense'],['housing','Nhà cửa & Nội thất','expense'],
  ['salary','Lương & Thưởng','income'],['freelance','Thu nhập thêm','income'],
  ['investment','Đầu tư & Lãi suất','income'],['savings','Tích lũy & Tiết kiệm','expense'],
  ['savings','Tích lũy & Tiết kiệm','income'],['other','Khoản thu chi khác','expense'],
  ['other','Khoản thu chi khác','income']
 ] as const;
 const normalize=(v:string)=>String(v).trim().replace(/\s+/g,' ').normalize('NFC').toLocaleLowerCase('vi');
 const custom=d.globalCategories||[];
 const items:any[]=[];
 for(const [id,name,type] of builtins){
   const overrides=custom.filter((c:any)=>c.type===type && (c._id===id || normalize(c.name)===normalize(name) || normalize(c.name)===normalize(id)));
   if(overrides.some((c:any)=>c.active===false)) continue;
   const replacement=overrides.find((c:any)=>c.active!==false);
   items.push({_id:id,name:replacement?.name || name,type,active:true});
 }
 for(const c of custom){
   if(c.active===false || !['income','expense'].includes(c.type)) continue;
   if(items.some(x=>x.type===c.type && (normalize(x.name)===normalize(c.name)||x._id===c._id))) continue;
   items.push({_id:c._id,name:c.name,type:c.type,active:true});
 }
 res.json({items});
});
router.use(requireAdmin as any);
// Keep the existing JSON Store implementation intact. MongoDB has its own
// collection-backed routes; never fall through to JSON handlers in Mongo mode.
router.use((req, res, next) => {
  if (isUsingMongo()) return mongoAdminRouter(req, res, () => res.status(404).json({ message: 'Không có API quản trị này.' }));
  next();
});
const safe = (u:any) => ({_id:u._id,name:u.name,email:u.email,role:u.role||'user',disabled:!!u.disabled,createdAt:u.createdAt});
const id = () => 'id_' + Date.now() + '_' + Math.random().toString(36).slice(2);
const log = (state:any, actor:string, action:string, target:string) => {
  const isCategory = action.includes('DANH MỤC');
  const entry = isCategory
    ? (state.globalCategories || []).find((c:any) => c._id === target)
    : state.users.find((u:any) => u._id === target);
  const by = state.users.find((u:any) => u._id === actor);
  state.activityLogs ||= [];
  state.activityLogs.push({
    _id:id(), actorId:actor, actorName:by?.name, actorEmail:by?.email,
    action, target, targetType:isCategory ? 'category' : 'user',
    targetName:entry?.name, targetEmail:isCategory ? undefined : entry?.email,
    createdAt:new Date().toISOString(),
  });
};
router.get('/users',(req,res)=>{const d=loadData();res.json({items:d.users.map(safe),total:d.users.length});});
router.patch('/users/:id',(req:AuthenticatedRequest,res)=>{
  const d=loadData(),u=d.users.find((x:any)=>x._id===req.params.id);if(!u)return res.status(404).json({message:'Không tìm thấy người dùng.'});
  const {name,role,disabled}=req.body||{};
  if(req.params.id===req.user!.userId && (role==='user'||disabled===true))return res.status(400).json({message:'Không được tự hạ quyền hoặc khóa tài khoản.'});
  if(u.role==='admin' && !u.disabled && (role==='user' || disabled===true) &&
     d.users.filter((x:any)=>x.role==='admin'&&!x.disabled).length<=1)
    return res.status(400).json({message:'Phải giữ ít nhất một quản trị viên đang hoạt động.'});
  if(typeof name==='string'&&name.trim().length>=2&&name.length<=100)u.name=name.trim();
  if(role==='admin'||role==='user')u.role=role;
  if(typeof disabled==='boolean')u.disabled=disabled;
  log(d,req.user!.userId,'CẬP NHẬT NGƯỜI DÙNG',u._id);saveData(d);res.json({success:true});
});
router.delete('/users/:id',(req:AuthenticatedRequest,res)=>{
  if(req.params.id===req.user!.userId)return res.status(400).json({message:'Không thể tự khóa tài khoản.'});
  const d=loadData(),u=d.users.find((x:any)=>x._id===req.params.id);if(!u)return res.status(404).json({message:'Không tìm thấy người dùng.'});
  if(u.role==='admin' && !u.disabled && d.users.filter((x:any)=>x.role==='admin'&&!x.disabled).length<=1)
    return res.status(400).json({message:'Không thể khóa quản trị viên cuối cùng.'});
  u.disabled=true;u.deletedAt=new Date().toISOString();log(d,req.user!.userId,'KHÓA NGƯỜI DÙNG',u._id);saveData(d);res.json({success:true});
});
router.get('/stats',(_req,res)=>{
 const d=loadData(),transactions=d.transactions;
 res.json({users:d.users.filter((x:any)=>!x.disabled).length,transactions:transactions.length,
 income:transactions.filter((x:any)=>x.type==='income').reduce((s:number,x:any)=>s+x.amount,0),
 expense:transactions.filter((x:any)=>x.type==='expense').reduce((s:number,x:any)=>s+x.amount,0)});
});
router.get('/categories',(_req,res)=>{
 const d=loadData();const names:Record<string,string>={food:'Ăn uống',bills:'Hóa đơn và tiện ích',shopping:'Mua sắm',transport:'Di chuyển',salary:'Lương',entertainment:'Giải trí',health:'Sức khỏe',education:'Giáo dục',savings:'Tiết kiệm',freelance:'Làm việc tự do',investment:'Đầu tư'};
 const base=(d.globalCategories||[]).map((c:any)=>({...c,transactionCount:0,totalAmount:0}));
 const found:any[]=[];
 for(const t of d.transactions){const canonical=(names[t.category]||t.category||'Không phân loại').trim();const key=canonical.toLocaleLowerCase('vi')+'|'+t.type;
  let target=base.find((c:any)=>c.name.trim().toLocaleLowerCase('vi')+'|'+c.type===key);
  if(!target){target=found.find(c=>c._key===key);if(!target){target={_id:'detected_'+encodeURIComponent(key),_key:key,name:canonical,type:t.type,active:true,detected:true,transactionCount:0,totalAmount:0};found.push(target);}}
  target.transactionCount++;target.totalAmount+=Number(t.amount)||0;
 }
 res.json({items:[...base,...found].map(({_key,...c}:any)=>c)});
});
router.post('/categories',(req:AuthenticatedRequest,res)=>{
 const name=String(req.body?.name||'').trim(),type=req.body?.type;
 if(name.length<2||name.length>80||!['income','expense'].includes(type))return res.status(400).json({message:'Danh mục không hợp lệ.'});
 const d=loadData();d.globalCategories ||= [];
 const normalized=(v:string)=>v.normalize('NFC').trim().replace(/\s+/g,' ').toLocaleLowerCase('vi');
 const legacyNames:Record<string,string>={food:'Ăn uống',bills:'Hóa đơn và tiện ích',shopping:'Mua sắm',transport:'Di chuyển',salary:'Lương',entertainment:'Giải trí',health:'Sức khỏe',education:'Giáo dục',savings:'Tiết kiệm',freelance:'Làm việc tự do',investment:'Đầu tư'};
 if(d.transactions.some((t:any)=>t.type===type && normalized(legacyNames[t.category] || t.category || '')===normalized(name)))return res.status(409).json({message:'Danh mục đã có trong giao dịch cũ. Hãy sử dụng danh mục đã phát hiện hoặc chuẩn hóa dữ liệu.'});
 if(d.globalCategories.some((c:any)=>normalized(c.name)===normalized(name)&&c.type===type&&c.active))return res.status(409).json({message:'Danh mục đã tồn tại.'});
 const cat={_id:id(),name,type,active:true};d.globalCategories.push(cat);log(d,req.user!.userId,'THÊM DANH MỤC',cat._id);saveData(d);res.status(201).json({id:cat._id});
});
router.patch('/categories/:id',(req:AuthenticatedRequest,res)=>{
 const d=loadData(),cat=(d.globalCategories||[]).find((x:any)=>x._id===req.params.id);
 if(!cat)return res.status(404).json({message:'Không có danh mục.'});
 const nextName=typeof req.body?.name==='string' ? req.body.name.trim() : cat.name;
 const nextActive=typeof req.body?.active==='boolean' ? req.body.active : cat.active;
 if(nextName.length<2 || nextName.length>80)return res.status(400).json({message:'Tên danh mục phải có 2–80 ký tự.'});
 if((d.globalCategories||[]).some((c:any)=>c._id!==cat._id&&c.type===cat.type&&c.active&&nextActive&&c.name.toLowerCase()===nextName.toLowerCase()))
   return res.status(409).json({message:'Danh mục đang sử dụng có tên trùng.'});
 cat.name=nextName;cat.active=nextActive;
 log(d,req.user!.userId,'SỬA DANH MỤC',cat._id);saveData(d);res.json({success:true});
});
router.delete('/categories/:id',(req:AuthenticatedRequest,res)=>{
 const d=loadData(),cat=(d.globalCategories||[]).find((x:any)=>x._id===req.params.id);if(!cat)return res.status(404).json({message:'Không có danh mục.'});
 cat.active=false;log(d,req.user!.userId,'NGỪNG DANH MỤC',cat._id);saveData(d);res.json({success:true});
});
router.get('/logs',(_req,res)=>{
  const d=loadData();
  const userById=new Map(d.users.map((u:any)=>[u._id,u]));
  const categoryById=new Map((d.globalCategories||[]).map((c:any)=>[c._id,c]));
  const items=(d.activityLogs||[]).slice().reverse().slice(0,200).map((l:any)=>{
    const isCategory=l.targetType==='category' || String(l.action).includes('DANH MỤC');
    const target:any=isCategory ? categoryById.get(l.target) : userById.get(l.target);
    const actor:any=userById.get(l.actorId);
    return {...l,targetType:isCategory?'category':'user',
      targetName:l.targetName||target?.name, targetEmail:l.targetEmail||(!isCategory?target?.email:undefined),
      actorName:l.actorName||actor?.name, actorEmail:l.actorEmail||actor?.email};
  });
  res.json({items});
});
export default router;

/**
 * GRADUATION INVITATION API — NO THIRD-PARTY DEPENDENCIES
 * Start: node server/server.mjs
 * Saves guests + chosen wording + PIN in server/data/invites.json.
 * Admin key is generated once in server/private/admin-key.txt, never placed in the public HTML.
 */
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';

const BASE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(BASE, '..');
const STORAGE = join(BASE, 'data', 'invites.json');
const KEY_FILE = join(BASE, 'private', 'admin-key.txt');
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 3000);
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',').map(x => x.trim()).filter(Boolean);
mkdirSync(dirname(STORAGE), { recursive: true });
mkdirSync(dirname(KEY_FILE), { recursive: true });
if (!existsSync(STORAGE)) writeFileSync(STORAGE, '{}\n');
if (!existsSync(KEY_FILE) && !process.env.INVITE_ADMIN_KEY) writeFileSync(KEY_FILE, randomBytes(24).toString('hex') + '\n', { mode: 0o600 });
const ADMIN_KEY = process.env.INVITE_ADMIN_KEY || readFileSync(KEY_FILE, 'utf8').trim();
if (ADMIN_KEY.length < 16) throw new Error('INVITE_ADMIN_KEY phải có ít nhất 16 ký tự.');

function json(res, status, data, origin) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store', ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {}) });
  res.end(JSON.stringify(data));
}
function corsOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return null;
  return ALLOWED_ORIGINS.includes(origin) ? origin : null;
}
function normalizeCode(name) {
  const words = String(name).replace(/([\p{Ll}\d])(?=\p{Lu})/gu, '$1 ')
    .trim().split(/[\s._-]+/u).filter(w => /[\p{L}]/u.test(w));
  return (words.map(w => w[0]).join('').normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'D')
    .replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'KM');
}
function validKey(input) {
  if (typeof input !== 'string') return false;
  const a = Buffer.from(input, 'utf8');
  const b = Buffer.from(ADMIN_KEY, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}
function loadData() {
  try {
    const d = JSON.parse(readFileSync(STORAGE, 'utf8'));
    return d && typeof d === 'object' && !Array.isArray(d) ? d : {};
  } catch (error) { throw new Error(`Không đọc được data/invites.json: ${error.message}`); }
}
function storeData(obj) {
  const temp = `${STORAGE}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(obj, null, 2) + '\n');
  renameSync(temp, STORAGE);
}
function sanitize(value, limit) { return typeof value === 'string' ? value.trim().slice(0, limit) : ''; }
function validatePin(raw) {
  if (raw == null) return null;
  const { x, y } = raw;
  if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 100 || y < 0 || y > 100) return undefined;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, label: sanitize(raw.label, 70) || 'Điểm hẹn' };
}
const SALUTATIONS = new Set(['ban','anh','chi','em','co','chu','gia-dinh','thay']);
const STYLES = new Set(['kinh-moi', 'than-moi', 'thuong-moi']);
const DEFAULTS = {
  messageTemplate: 'Hành trình đại học sẽ trọn vẹn hơn khi có {doi_tuong} ở đó. Hải rất mong được gặp {doi_tuong} trong ngày đặc biệt này!',
  quoteTemplate: 'Điều đáng quý nhất của hành trình không chỉ là đích đến, mà còn là những người đã đồng hành cùng mình.',
  closingTemplate: 'Hẹn gặp {doi_tuong} tại lễ tốt nghiệp của Hải. 🎓📸',
};
const STATIC_FILES = new Set(['/','/index.html','/style.css','/script.js','/site-config.js']);
const MIME = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8', '.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
const requestsByIP = new Map();
function rateLimit(req) {
  const ip = req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let v = requestsByIP.get(ip);
  if (!v || now-v.start>60_000) v={start:now,count:0};
  v.count++; requestsByIP.set(ip,v);
  if (requestsByIP.size>5000) requestsByIP.clear();
  return v.count <= 120;
}
function readBody(req) {
  return new Promise((resolveBody, reject) => {
    let raw='';
    req.on('data', chunk => { raw += chunk; if(raw.length>20000) {reject(new Error('Dữ liệu quá lớn.')); req.destroy();} });
    req.on('end', () => {try {resolveBody(JSON.parse(raw));} catch {reject(new Error('JSON không hợp lệ.'));} });
    req.on('error', reject);
  });
}
const server = createServer(async (req,res) => {
  const origin = corsOrigin(req);
  if (req.headers.origin && !origin) return json(res, 403, { error:'Nguồn truy cập không được phép. Cấu hình ALLOWED_ORIGINS.' });
  if (!rateLimit(req)) return json(res, 429, {error:'Quá nhiều yêu cầu, hãy thử lại sau.'}, origin);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { ...(origin ? {'Access-Control-Allow-Origin':origin, Vary:'Origin'}:{}),
      'Access-Control-Allow-Headers':'Content-Type, X-Invite-Admin-Key', 'Access-Control-Allow-Methods':'GET, POST, OPTIONS', 'Access-Control-Max-Age':'3600' });
    return res.end();
  }
  let path;
  try { path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { return json(res,400,{error:'Đường dẫn không hợp lệ.'},origin); }
  if (req.method==='GET' && path==='/api/health') return json(res,200,{ok:true,version:'10-custom-invites'},origin);
  if (req.method==='GET' && /^\/api\/invites\/[A-Za-z0-9]{1,14}$/.test(path)) {
    const code=path.split('/').pop().toUpperCase();
    const invite=loadData()[code];
    return invite ? json(res,200,invite,origin) : json(res,404,{error:'Chưa tìm thấy mã khách mời.'},origin);
  }
  if (req.method==='POST' && path==='/api/invites') {
    if(!validKey(req.headers['x-invite-admin-key'])) return json(res,401,{error:'Mã quản trị không đúng.'},origin);
    let body;
    try {body=await readBody(req);} catch(error){return json(res,400,{error:error.message},origin);}
    const name=sanitize(body.name,70);
    if (name.length<2 || name.length>70) return json(res,400,{error:'Tên phải có từ 2 đến 70 ký tự.'},origin);
    if(!SALUTATIONS.has(body.salutation)) return json(res,400,{error:'Xưng hô không hợp lệ.'},origin);
    const invitationStyle = STYLES.has(body.invitationStyle) ? body.invitationStyle : 'kinh-moi';
    const pin=validatePin(body.pin);
    if (pin === undefined) return json(res,400,{error:'Tọa độ PIN không hợp lệ.'},origin);
    const invite={name,salutation:body.salutation,invitationStyle,pin};
    for(const [field,max] of [['messageTemplate',600],['quoteTemplate',450],['closingTemplate',350]]){
      invite[field]=sanitize(body[field],max) || DEFAULTS[field];
    }
    const all = loadData();
    // Gửi lại cùng một thiệp thì trả mã cũ, không tạo bản trùng.
    const identical = Object.entries(all).find(([_, record]) =>
      JSON.stringify({name:record.name,salutation:record.salutation,invitationStyle:record.invitationStyle||'kinh-moi',pin:record.pin||null,
        messageTemplate:record.messageTemplate||DEFAULTS.messageTemplate,quoteTemplate:record.quoteTemplate||DEFAULTS.quoteTemplate,
        closingTemplate:record.closingTemplate||DEFAULTS.closingTemplate}) === JSON.stringify(invite));
    if (identical) return json(res,200,{code:identical[0],invite:identical[1],reused:true},origin);
    const base=normalizeCode(name);
    let code=base;
    for(let n=2; all[code]; n++) {
      code=`${base.slice(0, Math.max(1,14-String(n).length))}${n}`;
      if(n>50000) return json(res,409,{error:'Không thể cấp mã, hãy thử tên khác.'},origin);
    }
    all[code]=invite;
    try {storeData(all);} catch(error){return json(res,500,{error:`Không ghi được file dữ liệu: ${error.message}`},origin);}
    return json(res,201,{code,invite},origin);
  }
  if(req.method!=='GET') return json(res,405,{error:'Phương thức không được hỗ trợ.'},origin);
  if(!STATIC_FILES.has(path) && !/^\/assets\/[a-zA-Z0-9_.-]+$/.test(path)) return json(res,404,{error:'Không tìm thấy.'},origin);
  const pathname = path==='/' ? '/index.html' : path;
  const file=resolve(ROOT,'.'+pathname);
  if(!file.startsWith(ROOT+'/') || !existsSync(file)) return json(res,404,{error:'Không có tập tin.'},origin);
  try {
    const extension=extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type':MIME[extension]||'application/octet-stream',
      'Cache-Control': extension==='.html' || extension==='.js' ? 'no-cache' : 'public, max-age=3600' });
    res.end(readFileSync(file));
  } catch {json(res,500,{error:'Không đọc được tập tin.'},origin);}
});
server.listen(PORT, HOST, () => {
  console.log('\n✅ WEBSITE BOARDING PASS ĐANG CHẠY');
  console.log(`🌐 Mở: http://${HOST==='0.0.0.0'?'localhost':HOST}:${PORT}/`);
  console.log(`🔗 Tạo thiệp: http://${HOST==='0.0.0.0'?'localhost':HOST}:${PORT}/?builder=1`);
  console.log(`🔐 MÃ QUẢN TRỊ (GIỮ BÍ MẬT): ${ADMIN_KEY}`);
  console.log('⚠️ Đừng đưa server/private, server/data hay mã quản trị lên GitHub công khai.\n');
});

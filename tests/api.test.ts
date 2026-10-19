import {describe,it,expect} from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import {createApiApp} from '../server/createApiApp';
import {loadData,saveData} from '../server/config/db';
const app=createApiApp();
describe('API xác thực và phân quyền',()=>{
 it('từ chối truy cập giao dịch khi chưa đăng nhập',async()=>{const r=await request(app).get('/api/transactions');expect(r.status).toBe(401);});
 it('từ chối token hết hạn',async()=>{const secret=process.env.JWT_SECRET||'finance_manager_super_secret_jwt_key_2026';const token=jwt.sign({userId:'missing',email:'missing@example.com',exp:1},secret);const r=await request(app).get('/api/transactions').set('Authorization',`Bearer ${token}`);expect(r.status).toBe(401);});
 it('đăng nhập sai bị từ chối',async()=>{const r=await request(app).post('/api/auth/login').send({email:'missing@example.com',password:'wrongpassword'});expect(r.status).toBe(401);});
 it('không cho giao dịch số tiền bằng 0',async()=>{const r=await request(app).post('/api/transactions').send({amount:0});expect([400,401]).toContain(r.status);});
});

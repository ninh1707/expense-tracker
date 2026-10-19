import {describe,it,expect} from 'vitest';
import {validationResult} from 'express-validator';
import {registerValidation,transactionValidation,validate} from '../server/middlewares/validate';
// Validation rules can be run without opening a TCP port or modifying user data.
const check=async(rules:any[], body:any)=>{const req:any={body};for(const rule of rules)await rule.run(req);return validationResult(req).array();};
describe('Kiểm tra dữ liệu đầu vào',()=>{
 it('không chấp nhận mật khẩu đăng ký dưới 8 ký tự',async()=>{expect((await check(registerValidation,{name:'Nguyễn An',email:'an@example.com',password:'123456'})).length).toBeGreaterThan(0);});
 it('không chấp nhận số tiền âm',async()=>{expect((await check(transactionValidation,{amount:-5,type:'expense',category:'food',date:'2026-10-10'})).length).toBeGreaterThan(0);});
 it('không chấp nhận số tiền bằng 0',async()=>{expect((await check(transactionValidation,{amount:0,type:'income',category:'salary',date:'2026-10-10'})).length).toBeGreaterThan(0);});
 it('chấp nhận giao dịch hợp lệ',async()=>{expect(await check(transactionValidation,{amount:50000,type:'expense',category:'food',date:'2026-10-10'})).toEqual([]);});
});

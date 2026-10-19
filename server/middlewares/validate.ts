import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
export const validate = (rules: any[]) => async (req: Request, res: Response, next: NextFunction) => {
  await Promise.all(rules.map(rule => rule.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({success:false,message:'Dữ liệu không hợp lệ.',errors:errors.array().map((e:any)=>({field:e.path,message:e.msg}))});
  next();
};
const positive=(key:string)=>body(key).isFloat({gt:0}).withMessage('Số tiền phải lớn hơn 0.');
const date=(key:string)=>body(key).isISO8601({strict:true}).withMessage('Ngày không hợp lệ.');
const required=(key:string)=>body(key).isString().trim().notEmpty().withMessage('Không được để trống.');
export const registerValidation=[body('name').isString().trim().isLength({min:2,max:100}).withMessage('Họ tên phải có 2–100 ký tự.'),body('email').isEmail().withMessage('Email không hợp lệ.'),body('password').isLength({min:8}).withMessage('Mật khẩu phải có ít nhất 8 ký tự.')];
export const loginValidation=[body('email').isEmail().withMessage('Email không hợp lệ.'),required('password')];
export const transactionValidation=[positive('amount'),body('type').isIn(['income','expense']).withMessage('Loại giao dịch không hợp lệ.'),required('category'),date('date')];
export const budgetValidation=[positive('amount'),required('category'),body('period').optional().isIn(['monthly','weekly','yearly']).withMessage('Chu kỳ không hợp lệ.')];
export const savingsValidation=[positive('targetAmount'),required('name'),date('deadline')];
export const recurringValidation=[positive('amount'),required('title'),required('category'),body('frequency').isIn(['daily','weekly','monthly','yearly']).withMessage('Chu kỳ không hợp lệ.'),date('nextDueDate')];
export const partialValidation=(rules:any[])=>rules.map(rule=>rule.optional());

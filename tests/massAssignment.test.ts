import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('../server/models/Transaction', () => ({ TransactionModel: {
  findById: vi.fn(), findByIdAndUpdate: vi.fn(), paginate: vi.fn(),
} }));
vi.mock('../server/models/SavingsGoal', () => ({ SavingsGoalModel: {
  findById: vi.fn(), findByIdAndUpdate: vi.fn(),
} }));
import { TransactionModel } from '../server/models/Transaction';
import { SavingsGoalModel } from '../server/models/SavingsGoal';
import { TransactionService } from '../server/services/transactionService';
import { SavingsService } from '../server/services/savingsService';
const tx = vi.mocked(TransactionModel);
const sv = vi.mocked(SavingsGoalModel);
beforeEach(() => vi.resetAllMocks());
describe('Giới hạn trường cập nhật và chủ sở hữu', () => {
  it('Giao dịch: không cho request sửa userId/_id/createdAt', async () => {
    tx.findById.mockResolvedValue({ _id:'t1',userId:'owner',amount:1 } as any);
    tx.findByIdAndUpdate.mockResolvedValue({ _id:'t1',userId:'owner',amount:99 } as any);
    await TransactionService.update('owner','t1',{amount:99,userId:'other',_id:'hijacked',createdAt:'fake'} as any);
    expect(tx.findByIdAndUpdate).toHaveBeenCalledWith('t1',{amount:99});
  });
  it('Giao dịch: người khác không được cập nhật', async () => {
    tx.findById.mockResolvedValue({ _id:'t1',userId:'owner' } as any);
    await expect(TransactionService.update('intruder','t1',{amount:100})).rejects.toThrow();
    expect(tx.findByIdAndUpdate).not.toHaveBeenCalled();
  });
  it('Tiết kiệm: không cập nhật currentAmount, history trực tiếp', async () => {
    sv.findById.mockResolvedValue({ _id:'g1',userId:'owner',currentAmount:100,targetAmount:500 } as any);
    sv.findByIdAndUpdate.mockResolvedValue({ _id:'g1' } as any);
    await SavingsService.update('owner','g1',{targetAmount:300,currentAmount:999,history:[{id:'x',date:'2026-01-01',amount:999,type:'deposit'}]} as any);
    expect(sv.findByIdAndUpdate).toHaveBeenCalledWith('g1',{targetAmount:300,isCompleted:false});
  });
  it('Giao dịch: page phải hợp lệ', async () => {
    await expect(TransactionService.getPage('owner',{},0,20)).rejects.toThrow();
    await expect(TransactionService.getPage('owner',{},1,101)).rejects.toThrow();
    expect(tx.paginate).not.toHaveBeenCalled();
  });
  it('Giao dịch: phân trang trả metadata', async () => {
    tx.paginate.mockResolvedValue({items:[{_id:'t1'}],total:30} as any);
    const result=await TransactionService.getPage('owner',{},2,10);
    expect(result.totalPages).toBe(3);
    expect(tx.paginate).toHaveBeenCalledWith({userId:'owner'},2,10);
  });
});

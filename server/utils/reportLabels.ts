/** Từ điển nhãn xuất báo cáo, không đổi mã giao dịch lưu trữ. */
const categories: Record<string,string> = {
  food:'Ăn uống và cà phê', shopping:'Mua sắm cá nhân',transport:'Đi lại và xăng xe',
  bills:'Hóa đơn và tiện ích',entertainment:'Giải trí',education:'Giáo dục và học tập',
  health:'Y tế và sức khỏe',housing:'Nhà cửa',salary:'Lương và thưởng',
  freelance:'Thu nhập công việc tự do',investment:'Đầu tư và lãi suất',
  savings:'Tích lũy và tiết kiệm',other:'Khác'
};
const payments: Record<string,string> = {
  cash:'Tiền mặt',bank_transfer:'Chuyển khoản ngân hàng',
  credit_card:'Thẻ tín dụng hoặc ghi nợ',e_wallet:'Ví điện tử',other:'Khác'
};
export const categoryLabelVi=(code:string)=>categories[code] || code || 'Chưa phân loại';
export const paymentLabelVi=(code:string)=>payments[code] || code || 'Chưa xác định';

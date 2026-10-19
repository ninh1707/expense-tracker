# FinTrack VN — cập nhật giao diện theo ảnh tham khảo (19/10/2026)

Gói code này được phát triển từ `FinTrack_VN_FIX_LINT_TEST_JWT_2026_10_19.zip`, giữ nguyên những endpoint API và luồng nghiệp vụ của bản đó.

## Thay đổi

- **Ngân sách** (`src/components/Budgets/BudgetsView.tsx`): bố cục danh sách ngang như ảnh tham khảo, 4 thẻ thống kê tính từ phản hồi API (tổng ngân sách, đã sử dụng, còn lại, số danh mục đạt ngưỡng), tìm kiếm theo danh mục/ghi chú, lọc trạng thái, lọc danh mục, tháng. Form thêm/sửa và API xóa được giữ lại.
- **Mục tiêu tiết kiệm** (`src/components/Savings/SavingsView.tsx`): danh sách mục tiêu theo hàng, hiển thị ngày hạn, số tiền tích lũy, thanh tiến độ, tỷ lệ phần trăm; bộ lọc Tất cả/Đang thực hiện/Đã hoàn thành. Nạp tiền, rút tiền, chỉnh sửa, xóa, lịch sử sử dụng handler gốc.
- **Chi phí định kỳ** (`src/components/Recurring/RecurringView.tsx`): giữ thẻ tổng quan và bảng desktop, bộ lọc dữ liệu thật, bỏ thông báo rỗng trùng lặp. Chức năng xác nhận thanh toán vẫn mở hộp thoại xác nhận và gọi API như cũ.
- **Dashboard**: giữ phần chào mừng, chỉ số thu/chi/số dư, biểu đồ thu chi và phân loại; đồng bộ kiểu thẻ, viền, màu và khoảng cách với những trang khác qua `src/index.css`.
- **Responsive**: ngân sách 4 thẻ trên desktop, 2 thẻ trên tablet, 1 thẻ trên điện thoại; hàng ngân sách đổi thành thẻ dọc ở màn hình hẹp.

Không chèn số liệu từ ảnh mẫu vào code. Dữ liệu hiển thị và bộ lọc sử dụng dữ liệu trả về từ API.

## Kiểm tra và chạy trên máy Windows

```powershell
npm install
npm run lint
npm test
npm run build
```

Cấu hình `.env` dựa trên `.env.example`. Dùng Node để tạo khóa JWT, tương thích với Windows PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Dán khóa ngẫu nhiên vào `.env` với tên `JWT_SECRET`, không tải `.env` hoặc khóa lên mạng. Sau đó chạy `npm run dev`.

## Trạng thái kiểm tra trong môi trường tạo gói

- 60 file TS/TSX đã qua bước parse/transpile bằng TypeScript 5.8.3: không có lỗi cú pháp.
- Không thể cài đầy đủ dependency để chạy `npm run lint`, `npm test` hoặc `npm run build` tại đây do npm registry trả lỗi DNS `EAI_AGAIN`. Hãy chạy ba lệnh trên ở máy đã kết nối mạng trước khi sử dụng chính thức.
- Các ảnh giao diện trong Word chưa được cập nhật trong gói code này. Chụp ảnh sau khi chạy bản mới nếu cần đưa vào báo cáo.

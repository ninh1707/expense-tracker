# FinTrack VN — giao diện đồng bộ và báo cáo tương ứng

## Cách sử dụng
1. Cài Node.js 20+ và chạy `npm ci` từ thư mục `expense-tracker-main`.
2. Sao chép `.env.example` thành `.env`, thiết lập `JWT_SECRET` là chuỗi bí mật đủ mạnh theo hướng dẫn trong `.env.example`.
3. Chạy `npm run dev`, mở địa chỉ được hiển thị trong terminal.
4. Chạy `npm run lint`, `npm run build` và `npm test` trong môi trường có đủ dependency.

## Đối chiếu báo cáo
- Mục 2.4.2: User (gồm trường `role`, `disabled`) sở hữu Transaction/Budget/SavingsGoal/RecurringPayment qua `userId` (quan hệ 1–N); `recurringPaymentId` trên Transaction là tùy chọn.
- JSON Store có `globalCategories` (danh mục chung) và `activityLogs` (nhật ký hoạt động). Chức năng Admin chưa hỗ trợ đầy đủ trong MongoDB.
- Chương 3: SavingsView có 3 thẻ thống kê động và danh sách mục tiêu; RecurringView có 3 thẻ thống kê, lọc và bảng trên desktop/card trên mobile; SettingsView tổ chức card hai cột trên desktop.
- Các trang khác cùng sử dụng bộ màu sắc, border, shadow, focus và thiết kế responsive tại `src/index.css`; `AdminDashboard` dùng chung lớp `fintrack-admin-ui`.

## Giới hạn và kiểm chứng
- Thay đổi chỉ tác động đến phần trình bày / lọc client-side; các hàm API và xử lý nghiệp vụ gốc vẫn giữ.
- Đã kiểm tra cú pháp TS/TSX toàn bộ tệp bằng TypeScript transpilation. Chưa chạy được `npm run build`/`npm test` trong môi trường chuẩn vì không cài đặt được dependencies từ npm registry; cần thực hiện các lệnh này trên máy người dùng.
- Hình giao diện trong Word là các hình đã có từ phiên bản trước; không được xem là ảnh chụp đã đối chiếu với lần build này. Chưa bổ sung ảnh Admin giả.

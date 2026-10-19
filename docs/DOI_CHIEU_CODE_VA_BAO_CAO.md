# Đối chiếu mã nguồn và báo cáo

- Giao diện báo cáo: `src/components/Reports/ReportsView.tsx` và `PeriodCategoryReport.tsx`.
- Ánh xạ tiếng Việt: `src/utils/categories.ts`, `server/utils/reportLabels.ts`.
- CSV: `server/services/reportService.ts`, `server/controllers/reportController.ts`.
- Xác thực: `server/services/authService.ts`, tuyến `/api/auth`.
- Admin: `server/routes/adminRoutes.ts`; không tự tạo mật khẩu Admin mặc định.
- Tài liệu Word dùng sơ đồ thiết kế, không giả làm ảnh chụp chạy thực tế.
- Đã sửa nhãn danh mục trong thống kê theo khoảng ngày; ánh xạ tiếng Việt khi xuất CSV và chặn CSV formula injection.
- Bộ lọc ngày tùy chọn và thống kê tháng/quý/năm còn là hai cơ chế riêng trong UI.
- Cần chạy `npm install && npm run lint && npm run build && npm test` và kiểm thử thủ công trên Windows.
- `package-lock.json` nếu không khớp `package.json` phải được đồng bộ trên máy có kết nối npm, chưa xác nhận `npm ci`.
- Quy định thể thức đồ án riêng không có trong file đã kiểm tra; phải đối chiếu bản quy định chính thức trước khi nộp.

# Kiểm tra biểu đồ FinTrack VN

Đã rà bốn biểu đồ Recharts trong source:
- Dashboard: xu hướng Thu – Chi (AreaChart); cơ cấu chi tiêu (PieChart).
- Báo cáo: so sánh Thu – Chi (BarChart); phân bổ chi tiêu (PieChart).
- Admin: phần dashboard quản trị hiện dùng các thẻ thống kê, không có Recharts.

## Thay đổi
- Chỉ hai file `src/components/Dashboard/DashboardView.tsx` và `src/components/Reports/ReportsView.tsx`.
- Bỏ `ResponsiveContainer` lồng ngoài, chuyển sang `responsive` của Recharts 3.10.1 và đặt kích thước biểu đồ trực tiếp. Giữ nguyên dữ liệu, biểu đồ con, tooltip, API, state, route và các event handlers.
- Giữ lại các giao diện ngân sách/tiết kiệm/định kỳ vì chúng dùng thanh tiến độ/chỉ số, không dùng Recharts trong source đang xét.

## Các bước kiểm tra trên Windows
1. Vào `expense-tracker-main`.
2. Giữ file `.env` hợp lệ từ bản đang chạy (không gửi khóa trong ZIP).
3. Chạy `npm install`, `npm run lint`, `npm run build`, `npm test`, `npm run dev`.
4. Mở Dashboard và Báo cáo, đổi kỳ báo cáo, thử 360/768/1024/1440 px, kiểm tra F12 Console.
5. Nếu vẫn trống: ở F12 Console chạy:
   ```js
   [...document.querySelectorAll('.recharts-wrapper')].map(el => ({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,svg:!!el.querySelector('svg')}))
   ```
   Gửi kết quả và các lỗi Console; có thể do runtime/container chứ chưa thể kết luận đã sửa dứt điểm.

**Trạng thái:** Đã kiểm tra tĩnh vị trí sử dụng Recharts. Chưa có bằng chứng chạy trình duyệt/lint/build/test trong môi trường đóng gói này.

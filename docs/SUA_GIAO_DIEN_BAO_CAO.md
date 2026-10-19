# Bản vá giao diện và file xuất
- `LanguageContext.tsx`: bổ sung từ điển Cài đặt và fallback từ điển tiếng Việt.
- `SettingsView.tsx`: tiêu đề và nhãn chính đi qua hàm dịch.
- `ReportsView.tsx`: thay PDF font mặc định bằng hàm vẽ text Unicode lên canvas; chuyển phần lọc ngày vào khu vực phân tích.
- `src/utils/pdfReport.ts`: tạo PDF nhiều trang bằng canvas, tránh lỗi ký tự tiếng Việt của font jsPDF.
- `server/services/reportService.ts`, `server/utils/reportLabels.ts`: tên danh mục và phương thức thanh toán trong CSV hiển thị bằng tiếng Việt.
- `PeriodCategoryReport.tsx`: làm đồng bộ card, nút và bảng; chặn khoảng ngày không hợp lệ.

## Cần kiểm thử trực tiếp
`npm install && npm run lint && npm run build && npm test && npm run dev`. Kiểm tra PDF nhiều trang với dữ liệu dài, Excel mở CSV trên Windows và kiểm tra khoảng lọc theo dữ liệu thật. CSV không thể đặt độ rộng cột tự động; Excel có thể hiện ### cho ngày nếu cột quá hẹp. Nếu cần bảng tính có độ rộng định sẵn, phải triển khai định dạng XLSX thay vì CSV.

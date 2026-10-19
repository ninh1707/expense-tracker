# Sửa lỗi xuất CSV, bản dịch và danh mục chung

## Thay đổi và căn cứ

1. `server/services/reportService.ts`: xuất UTF-8 BOM, CRLF và CSV ngăn bởi dấu chấm phẩy; bao mọi ô bằng dấu nháy kép và escape dấu nháy kép. Excel tiếng Việt thường hiểu dấu chấm phẩy tốt hơn. File vẫn là CSV, không phải XLSX.
2. `server/controllers/reportController.ts`: tiếp tục trả `text/csv; charset=utf-8`, giữ nguyên endpoint `/api/reports/export?format=csv`.
3. `src/services/api.ts`: không tải response lỗi thành file CSV, thu hồi object URL sau khi tải.
4. `src/contexts/LanguageContext.tsx`: bổ sung bản dịch `rep.period_month`, `rep.period_quarter`, `rep.period_year`, `rep.income_vs_expense`, `rep.category_distribution`.
5. `server/routes/adminRoutes.ts`: endpoint `/api/admin/categories/active` trả cả danh mục hệ thống và danh mục do Admin tạo, không trả danh mục Admin đã ngừng dùng; giữ giá trị `_id`, `name`, `type`, `active`.
6. `src/components/Transactions/TransactionFormModal.tsx`: dùng danh mục đang hoạt động API trả về thay cho việc luôn nối với các danh mục mặc định; chỉ fallback danh mục mặc định khi API lỗi; khi danh mục đang chọn không còn hợp lệ hoặc đổi Thu/Chi thì chọn lại phù hợp.
7. `src/utils/categories.ts`: đổi một nhãn còn pha tiếng Anh sang tiếng Việt.

## Cần lưu ý

- Chưa triển khai gộp danh mục tương đương như `food` và `Ăn uống`. Gộp tự động có thể gây sai thống kê hoặc tham chiếu ngân sách.
- Bản này vẫn dùng JSON Store cho quản trị; endpoint danh mục trả 503 khi bật MongoDB, chưa có repository danh mục MongoDB.
- `package-lock.json` đi kèm từ bản giao trước chưa đồng bộ dependency. Hãy dùng `npm install` (không phải `npm ci`) trước, rồi chạy `npm run lint`, `npm run build`, `npm test`.
- Môi trường kiểm tra không tải được dependency (`EAI_AGAIN`) nên không chạy được 3 lệnh đó tại đây; đã kiểm tra cú pháp TS/TSX bằng TypeScript compiler API và tính toàn vẹn ZIP. Không đánh dấu browser tests là Pass.
- Giữ riêng `.env` và `data/db.json` đang dùng. Không chép dữ liệu từ ZIP đè dữ liệu thật.

## Kiểm thử thủ công ưu tiên

1. Xuất CSV chứa các chữ `Tiền điện tháng 10`, `Cà phê` và mô tả có dấu phẩy, dấu nháy kép, emoji; mở bằng Excel Windows kiểm tra 7 cột và dấu tiếng Việt.
2. Báo cáo tài chính có ba nhãn `Theo tháng`, `Theo quý`, `Theo năm`; không còn `rep.period_*`.
3. Admin thêm `Lương123` loại Thu. User mở biểu mẫu loại Thu thì thấy danh mục; chuyển Chi thì không thấy.
4. Admin thêm `Cà phê` loại Chi. User mở biểu mẫu loại Chi thấy danh mục; chuyển Thu thì không thấy.
5. Admin ngừng dùng `Cà phê`; đóng và mở lại form User; danh mục không còn khả dụng, giao dịch cũ không bị xóa.
6. Admin tạo danh mục trùng cùng loại; API phải trả 409; khác loại được phép.
7. Đổi Thu/Chi khi đã chọn một danh mục; không được lưu với danh mục thuộc loại khác.
8. API danh mục lỗi hoặc offline: form còn danh mục mặc định, hiển thị lỗi lưu khi server không khả dụng.
9. Chạy `npm run lint`, `npm run build`, `npm test`; ghi kết quả thực tế trước khi triển khai.

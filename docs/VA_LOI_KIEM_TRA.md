# Kiểm tra bản sửa lỗi

- CSV: kiểm tra UTF-8 BOM, dấu chấm phẩy, dấu tiếng Việt và kỳ tháng/quý/năm.
- Danh mục: form User lấy danh sách active từ API, giữ mã built-in; API hỏng mới dùng fallback.
- Danh mục cũ: không tạo bản sao nếu trùng tên chuẩn hóa với danh mục phát hiện.
- Ngày mặc định form giao dịch lấy theo ngày địa phương thay vì UTC.

**Giới hạn:** chưa đồng bộ MongoDB ở module Admin; chưa giải quyết race condition ghi JSON giữa nhiều tiến trình; cần kiểm thử tương tác trình duyệt.

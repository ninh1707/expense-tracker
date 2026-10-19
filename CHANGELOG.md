# Nhật ký thay đổi

## [Unreleased]
- `feat(security): add auth rate limit and input validation` — Giới hạn đăng nhập/đăng ký, validator theo trường thực tế, cảnh báo JWT.
- `feat(admin): show categories discovered in transactions` — Hiển thị danh mục phát hiện từ giao dịch và thống kê số lượng/tổng chi; không tự động gộp dữ liệu có thể khác nghĩa.
- `feat(categories): fetch active global categories for transactions` — Danh mục đang dùng có thể chọn trong biểu mẫu thu chi.
- `fix(storage): add atomic writes and rotating backups` — Sao lưu tối đa 10 bản, ghi tệp tạm rồi đổi tên.
- `chore(project): organize docs and metadata` — npm, gitignore, tài liệu, giấy phép.
- `feat(observability): extend health and request log` — Tăng thông tin chẩn đoán.

### Giới hạn cần tiếp tục
- Đã tạo Mongoose schemas và lớp lựa chọn backend tại 5 model, nhưng **các API quản trị/báo cáo dùng `loadData` trực tiếp vẫn chỉ đọc JSON**; chưa xác nhận hành vi toàn hệ thống khi chọn MongoDB. Không khuyên bật MongoDB trước khi hoàn tất đồng bộ.
- Cơ chế lưu JSON là đồng bộ, phù hợp một tiến trình Node; chưa có khoá liên tiến trình.
- Chưa thực hiện migration/gộp hai danh mục cũ khác mã (`food` và `Ăn uống`), tránh phá dữ liệu.
- Thuật ngữ tiếng Việt đã chuẩn hóa ở các thành phần được sửa, chưa kiểm duyệt toàn bộ giao diện một cách độc lập.
- Kiểm thử build, type-check và integration phụ thuộc việc cài dependencies thành công.

### Cài thư viện lần đầu cho bản phát triển này
Trong môi trường tạo gói, npm registry lỗi DNS (`EAI_AGAIN`); `package-lock.json` chưa thể cập nhật. Trên máy có Internet, **chạy `npm install` một lần** để cập nhật lockfile, sau đó mới chạy `npm ci`, `npm run lint`, `npm run build`, `npm test`. Không báo đạt khi chưa chạy được.

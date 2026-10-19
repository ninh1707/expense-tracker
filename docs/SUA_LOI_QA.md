# Bản sửa lỗi QA (ưu tiên bảo mật và tính nhất quán)

- JWT: loại bỏ khóa bí mật mặc định; server ngừng khởi động khi `JWT_SECRET` thiếu hoặc không đủ 32 ký tự. Tạo bằng `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`, lưu trong `.env`, không chia sẻ.
- Frontend: đồng bộ logout/login giữa nhiều tab qua sự kiện `storage` và xử lý token lỗi qua sự kiện nội bộ. Cần kiểm tra trên trình duyệt.
- API Admin khi MongoDB hoạt động: trả 503 có thông báo thay vì âm thầm thao tác trên JSON sai nguồn. Chưa triển khai repository Mongo Admin nên **chưa thể gọi là hỗ trợ MongoDB hoàn chỉnh**.
- **Chưa sửa hết 15 vấn đề QA**: đặc biệt race condition cho chuỗi đọc–sửa–ghi `db.json`, đồng bộ danh mục cũ và chức năng admin đầy đủ khi MongoDB đang chạy. Không sử dụng MongoDB ở môi trường thực tế trước khi hoàn thiện.
- Cần chạy `npm ci && npm run lint && npm run build && npm test`; kiểm thử browser các thao tác Admin, multi-tab và token hết hạn.
- Không đưa `.env`, `data/db.json`, `data/backups` vào ZIP; mang dữ liệu từ project cũ bằng cách sao lưu và chép riêng.

# HƯỚNG DẪN BẢN SỬA: TẠO VÀ ĐĂNG NHẬP ADMIN

## 1. Chạy trong thư mục project

```bash
npm ci
npm run admin:create
```

Lệnh thứ hai hỏi email và **mật khẩu mới** (tối thiểu 12 ký tự). Nhập email mới để tạo Admin riêng hoặc email tài khoản cũ để cấp quyền; mật khẩu tài khoản cũ sẽ đổi thành mật khẩu mới đã nhập. Không cần mở hoặc sửa `data/db.json` thủ công, và không có mật khẩu Admin mặc định.

Sau đó chạy `npm run dev`, truy cập http://localhost:3000, **đăng xuất tài khoản demo** rồi đăng nhập email và mật khẩu vừa khai báo. Admin thấy khu vực `FinTrack VN – Quản trị`; user thường vẫn thấy dashboard cá nhân.

Nếu đang mở trang bằng token cũ, hãy đăng xuất rồi đăng nhập lại. Phải chạy lệnh tại đúng thư mục chứa package.json và data/db.json của ZIP này; tránh nhầm với thư mục cũ.

## 2. Kiểm tra phân quyền

- Admin truy cập API `/api/admin/users` thành công khi gửi JWT.
- User thường gọi cùng API phải nhận HTTP 403.
- Token thiếu hoặc hết hạn phải bị chặn.
- Tạo một user thông thường qua trang đăng ký: không có quyền Admin.
- Dữ liệu `data/db.json` lưu user có `role: "admin"` sau khi chạy `npm run admin:create`.

## 3. Xem thống kê

Vào Báo cáo, thử Hôm nay / 3 ngày / 1 tuần / 1 tháng và khoảng Từ ngày - Đến ngày. So sánh tổng thu chi, số giao dịch và danh mục với dữ liệu đã nhập.

## 4. Chú ý bảo mật

Không đưa mật khẩu hay file .env vào báo cáo/GitHub. Cơ chế lưu trữ nghiệp vụ hiện tại là file JSON; cần sao lưu dữ liệu trước khi nghiệm thu.

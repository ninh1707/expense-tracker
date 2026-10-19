FINTRACK VN — PATCH ADMIN MONGODB (19/10/2026)
==========================================
Dành cho bản nguồn đang chạy tại:
FinTrack_VN_FIX_LINT_TEST_JWT_2026_10_19\expense-tracker-main
Có thể áp dụng sau patch giao diện/icon và patch xác nhận mật khẩu.

NỘI DUNG CẬP NHẬT
- API Admin trên MongoDB: người dùng, phân quyền, khóa/mở khóa, thống kê,
  danh mục chung và nhật ký hoạt động; dữ liệu thực ở các collections MongoDB.
- /api/admin/categories/active lấy danh mục từ MongoDB cho người dùng thường.
- npm run admin:create tạo hoặc cấp quyền Admin trên MongoDB (nếu MONGODB_URI).
- Loại bỏ khai báo index email trùng trên Mongoose User.
- Khi MONGODB_URI đã cấu hình nhưng server MongoDB lỗi, dừng thay vì tự rơi
  về JSON Store để tránh nhầm lẫn dữ liệu.

KHÔNG THAY ĐỔI
- data/db.json, data/db.backup.json, .env, node_modules, package.json,
  tài khoản và dữ liệu MongoDB hiện có.
- Không di chuyển dữ liệu JSON Store sang MongoDB. Nếu các chỉ số trống,
  đó có thể là do MongoDB chưa có giao dịch.

CÀI PATCH TRÊN POWERSHELL (tại thư mục expense-tracker-main):
1. Ctrl+C để dừng server (nếu đang chạy).
2. Backup mã nguồn backend:
   Copy-Item .\server .\server.backup-before-admin-mongo -Recurse -Force
3. Sau khi tải patch về Downloads:
   Expand-Archive -Path "$env:USERPROFILE\Downloads\fintrack-admin-mongodb-patch.zip" -DestinationPath (Get-Location).Path -Force
4. npm run dev
5. Kiểm tra /api/health có db.type="mongo" và db.connected=true.
6. Đăng xuất/đăng nhập lại Admin, mở Tổng quan/Người dùng/Danh mục/Nhật ký.

TẠO HOẶC CẤP QUYỀN ADMIN (NẾU CHƯA CÓ)
- Dừng server để thao tác an toàn, có thể chạy 'npm run admin:create'
  ở cửa sổ PowerShell khác nếu server đang chạy nhưng không cần nếu Admin
  hiện tại đã đăng nhập đúng quyền.
- Nhập email và mật khẩu >=12 ký tự theo lời nhắc.
- Nếu email đã có, lệnh này sẽ CẤP QUYỀN ADMIN VÀ THAY MẬT KHẨU tài khoản đó.
- Lệnh chỉ tạo/cấp quyền, không xóa hoặc tự chuyển giao dịch từ JSON.

KIỂM THỬ KHUYẾN NGHỊ
- Admin: /api/admin/stats, /users, /categories, /logs đều trả 200.
- Người dùng thường: không truy cập được Admin (403).
- Không cho phép Admin tự khóa/tự hạ quyền; không cho khóa Admin cuối.
- Tạo rồi ngừng dùng một danh mục thử, kiểm tra nhật ký và Compass.
- npm run lint ; npm test ; npm run build.

CÁC FILE ĐƯỢC THAY / THÊM
server/routes/adminRoutes.ts (thay)
server/routes/adminMongoRoutes.ts (MỚI)
server/createAdmin.ts (thay)
server/models/User.ts (thay)
server/config/db.ts (thay)

GIỚI HẠN KIỂM THỬ
Đã chạy 14 kịch bản logic bằng DB giả lập, cú pháp TypeScript/TSX 59 file.
CHƯA chạy kiểm thử tích hợp MongoDB thật, npm lint/test/build vì ở môi trường
đóng gói thiếu dependency npm, không truy cập registry; phải kiểm tra trên máy.

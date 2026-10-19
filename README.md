# FinTrack VN

## Quick Start
```bash
git clone <URL_REPOSITORY_CUA_BAN>
cd expense-tracker-main
npm ci
cp .env.example .env
npm run dev
```
Trên Windows PowerShell, dùng `Copy-Item .env.example .env`. Đổi `JWT_SECRET` trong `.env` bằng `openssl rand -hex 32` và đặt `APP_URL` phù hợp. **Chỉ dùng npm**; không dùng Bun. Mở http://localhost:3000.

## Giới thiệu
Ứng dụng quản lý chi tiêu cá nhân với React, TypeScript, Express.

## Chức năng
Thu chi, ngân sách, tiết kiệm, định kỳ, báo cáo và quản trị.

## Trạng thái tính năng
| Tính năng | Trạng thái | Ghi chú |
|---|---|---|
| Thu chi cá nhân | Đang triển khai | Có JSON store, cần kiểm thử trực tiếp |
| Admin | Đang triển khai | Tạo tài khoản bằng `npm run admin:create` |
| Danh mục chung | Một phần | Danh mục động khi tạo giao dịch, dữ liệu cũ cần ánh xạ |
| MongoDB | Chưa hoàn tất | Kết nối có nhưng mô hình hiện dùng JSON store |
| Kiểm thử tự động | Một phần | Cần chạy `npm test` sau cài dependencies |

## Cấu hình
MongoDB là tùy chọn. Nếu không có `MONGODB_URI`, dữ liệu lưu trong `data/db.json`.

## Quản trị
Chạy `npm run admin:create`, nhập email hợp lệ và mật khẩu đủ 12 ký tự. Không đóng gói dữ liệu cá nhân vào ZIP.

## Kiểm tra
`npm run lint` · `npm run build` · `npm test`.

## API
Các endpoint hiện có giữ nguyên. `/api/health` hiển thị trạng thái hệ thống.

## Tài liệu
Xem [`docs/`](docs/) và [`CHANGELOG.md`](CHANGELOG.md).

## Bản quyền
MIT – xem [`LICENSE`](LICENSE).

# Khởi động FinTrack VN trên Windows PowerShell

## 1. Đồng bộ lockfile và cài phụ thuộc

Trong thư mục `expense-tracker-main` (nơi có `package.json`), chạy:

```powershell
npm install
npm run lint
npm run build
npm test
```

**Lưu ý:** `package-lock.json` đi kèm gói chưa được đồng bộ bằng npm trong môi trường biên soạn do không tải được registry. Chạy `npm install` ít nhất một lần để cập nhật `package-lock.json`. Sau khi cập nhật thành công, các lần tiếp theo có thể dùng `npm ci`.

## 2. Tạo khóa JWT an toàn

Tạo `.env` bằng lệnh:

```powershell
Copy-Item .env.example .env
```

Sau đó mở `.env`, đặt `JWT_SECRET` thành một chuỗi ngẫu nhiên dài ít nhất 32 ký tự. Ví dụ tạo chuỗi bằng PowerShell:

```powershell
$secret = [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
$secret
```

Dán chuỗi vừa tạo vào `.env` ở dòng `JWT_SECRET=...` (không chia sẻ khóa riêng trong chat hoặc Git). Có thể thay bằng `openssl rand -hex 32` nếu máy đã cài OpenSSL.

## 3. Khởi động

```powershell
npm run dev
```

Mở `http://localhost:3000`. Khi không có `MONGODB_URI`, chương trình dùng JSON Store.

## Tình trạng xác minh

- Đã xóa một dòng `import` lặp gây TS2300 trong `server/services/reportService.ts`.
- Log kiểm thử do người dùng cung cấp trước khi sửa cho thấy build thành công và 8/8 bài test đạt, nhưng lint gặp import trùng.
- Chưa chạy lại đầy đủ npm trong môi trường biên soạn do thiếu gói trong npm cache/không tải được registry; cần kiểm tra bằng các lệnh trên tại máy người dùng.
- Không thay đổi giao diện hoặc API so với ZIP UI trước đó ngoài xóa import thừa.

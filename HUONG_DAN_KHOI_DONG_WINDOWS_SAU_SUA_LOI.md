# Khắc phục lỗi trên Windows (19/10/2026)

## 1. Khởi tạo biến môi trường

Trong PowerShell, tại thư mục `expense-tracker-main`, tạo `.env` từ mẫu (chỉ cần làm một lần):

```powershell
Copy-Item .env.example .env
```

Mở file `.env` và thay `JWT_SECRET="CHANGE_ME_USE_OPENSSL_RAND_HEX_32"` bằng khóa ngẫu nhiên mới. Tạo bằng lệnh PowerShell:

```powershell
[Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Ví dụ lệnh trên tạo 64 ký tự hex; sao chép kết quả vào `.env`:

```dotenv
JWT_SECRET=THAY_BANG_KET_QUA_NGAU_NHIEN_CUA_MAY_BAN
```

Không đưa `.env` lên Git hoặc chia sẻ khóa JWT với người khác. Nếu `Convert.ToHexString` chưa có, có thể dùng:

```powershell
-join ([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32) | ForEach-Object { $_.ToString('x2') })
```

## 2. Kiểm tra lại

```powershell
npm run lint
npm test
npm run build
npm run dev
```

* Sửa lỗi `RecurringView.tsx`: danh mục lọc về kiểu `string[]` trước khi gọi `getCategoryById`.
* Sửa `tests/api.test.ts`: token hết hạn phải trả `401 Unauthorized`, không phải `403 Forbidden`.
* `npm run dev` chỉ chạy sau khi cấu hình `JWT_SECRET` an toàn.
* Nếu npm báo lỗ hổng dependency, chạy `npm audit` để xem từng gói và đề xuất nâng cấp. Không chạy `npm audit fix --force` khi chưa đánh giá ảnh hưởng đến phiên bản công nghệ.

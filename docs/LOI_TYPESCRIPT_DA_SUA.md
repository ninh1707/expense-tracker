# Sửa lỗi từ kết quả kiểm tra ngày 10/10/2026

- `server/models/{User,Transaction,Budget,SavingsGoal,RecurringPayment}.ts`: khai báo `Mongo` rõ kiểu `mongoose.Model<any>` để giải quyết 15 lỗi TS2349 / TS2345 khi dùng các phương thức Mongoose. Đây là sửa kiểu, không thay đổi đường dẫn API.
- `server/utils/seedData.ts`: thay utility seed cũ vốn import tên model không còn export và xóa dữ liệu bằng hàm seed demo không phá hủy `AuthService.seedDemoUser()`. Giải quyết 5 lỗi TS2724.
- `server.ts`: xóa `import.meta.url` không sử dụng, tránh cảnh báo khi bundling server dưới định dạng CommonJS.
- Kiểm tra lại bằng `npm run lint`, `npm run build`, `npm test`. Các lệnh cần dependencies đã cài bằng `npm install`.
- Cảnh báo `JWT_SECRET`: tạo secret bằng `openssl rand -hex 32`, lưu trong `.env`. Không đưa khóa thật vào ZIP.
- `npm audit` báo 12 lỗ hổng ở môi trường của người dùng: chưa khẳng định đã xử lý; hãy chạy `npm audit` để xác định gói ảnh hưởng trước khi nâng cấp.
- Log `GET /alerts 401`, `GET /reminders 401` cần theo dõi request nào gọi khi chưa đăng nhập; log hiện chưa chứng minh lỗi đăng nhập.

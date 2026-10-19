PATCH NHỎ FINTRACK VN - 19/10/2026

Mục đích: sửa một lỗi TS2741 ở server/routes/adminMongoRoutes.ts dòng 115.
Nội dung thay đổi duy nhất: const update: Doc = {}; -> const update: Partial<Doc> = {};

Không có .env, db.json, node_modules hoặc dữ liệu người dùng trong patch.
KHÔNG cần npm install nếu dependencies của bạn không đổi.

Cách áp dụng trên Windows PowerShell:
1. Dừng server (Ctrl+C). Sao lưu file server/routes/adminMongoRoutes.ts đang chạy.
2. Giải nén ZIP này vào đúng thư mục gốc expense-tracker-main, cho phép ghi đè.
3. Chạy: npm run lint
4. Chạy: npm test
5. Chạy: npm run build
6. Chạy: npm run dev

Xác minh trong môi trường phân tích: tsc --noEmit chạy thành công trên snapshot source sau thay đổi này.
Vì node_modules gửi kèm được cài trên Windows, việc chạy Vitest/Vite ở Linux bị chặn vì thiếu module Rollup bản Linux.
Các kiểm tra mock độc lập cho services không phải integration test và không thay thế npm test.

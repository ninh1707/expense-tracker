# Tình trạng kiểm chứng và giới hạn

## Đã sửa (cần chạy thử trên máy người dùng)
1. **Bảo mật:** thêm rate-limit, cors, validation đầu vào; sửa cảnh báo secret; handler lỗi vẫn phải rà lại tất cả lỗi bất đồng bộ từ router tự viết.
2. **Admin và danh mục:** danh mục trong giao dịch lịch sử được phát hiện và hiển thị tiếng Việt tại Admin; thống kê số lượng và tổng tiền; API public cho tài khoản đã đăng nhập chỉ trả danh mục active; biểu mẫu thêm giao dịch sử dụng danh mục chung có fallback. Danh mục phát hiện từ dữ liệu chưa cho sửa trực tiếp để tránh thay đổi sai lệch.
3. **MongoDB:** Mongoose schema và wrapper chọn backend cho năm Model. Tuy nhiên Admin/API thống kê còn truy cập JSON trực tiếp, vì thế chế độ MongoDB **chưa hoàn chỉnh**.
4. **JSON:** sao lưu 10 bản gần nhất, ghi tạm rồi rename. Hàm `saveData` đồng bộ bảo đảm không trùng ghi trong một tiến trình JS; **không khoá liên tiến trình**.
5. **Test:** đã thêm test nguồn Vitest/Supertest, nhưng chưa chạy thành công trong môi trường đóng gói. Không báo PASS.
6. **Dọn dẹp:** README, LICENSE, gitignore, docs, bỏ bun.lock, cập nhật metadata.
7. **Health:** thời gian, uptime, version và trạng thái DB, log request ở môi trường dev.
8. **README:** hướng dẫn Quick Start và bảng tình trạng tính năng.

## Lệnh chạy tại máy có Internet
```powershell
npm install
npm run lint
npm run build
npm test
npm run dev
```
Nếu npm báo lỗi, giữ nguyên log đầy đủ; không chạy `npm audit fix --force`.

## Lưu ý
- Trước khi thay phiên bản phải sao lưu `data/db.json`.
- Chỉ nhóm thao tác và mã nguồn được sửa được kiểm tra cú pháp. Không chứng nhận 8 nhóm đạt hết.
- Không nên bật MongoDB ở môi trường chứa dữ liệu thật khi Admin vẫn dùng JSON.
- Danh mục tên `food` và `Ăn uống` đang được **hiển thị chuẩn hóa**, chưa tự động gộp ID hay chuyển dữ liệu.

# FinTrack VN – Bản rà soát đăng nhập và điều hướng (10/10/2026)

## Thay đổi
- Khi đăng nhập sai email/mật khẩu: giữ nguyên email, xóa mật khẩu và ô xác nhận, hiển thị thông báo lỗi ngay trong form, đưa focus về mật khẩu.
- Khi đăng ký thất bại: giữ email và họ tên, xóa các trường mật khẩu.
- Không cho trình duyệt chặn xác thực đăng nhập bằng quy tắc tối thiểu 6 ký tự (quy tắc này chỉ dành cho tạo tài khoản); mọi mật khẩu đăng nhập được kiểm tra bởi API.
- Hiển thị thông báo khi máy chủ trả về lỗi HTTP hoặc phản hồi không phải JSON.
- Tắt **tự đăng nhập tài khoản Demo** khi chưa có token; người dùng chỉ vào Demo khi bấm nút tương ứng. Điều này tránh đột ngột quay về tài khoản Demo.
- Admin giữ tab đang thao tác khi tải lại, các nút thao tác dùng `type=button`, tránh tự khóa/hạ quyền tài khoản quản trị đang đăng nhập.

## Dữ liệu và tài khoản
Để tránh phát tán mật khẩu băm và dữ liệu người dùng trong một file nén, `data/db.json` trong ZIP này được **khởi tạo trống**. Trước khi thay project, **sao lưu `data/db.json` từ bản đang chạy và chép sang bản mới**. Không cần tạo tài khoản Admin mới khi giữ file này.

## Kiểm thử thủ công bắt buộc
1. Đăng nhập với email hợp lệ nhưng mật khẩu sai: báo lỗi, giữ email, mật khẩu trống, focus vào mật khẩu, không điều hướng.
2. Đăng nhập với email không tồn tại: hành vi như trên.
3. Bỏ trống email/mật khẩu: cảnh báo native/form, không gửi API.
4. Đăng nhập đúng Admin: vào Admin, tab Người dùng không tự chuyển về Tổng quan khi đổi quyền người dùng khác.
5. Thao tác Danh mục chung: thêm/sửa/ngừng dùng, không rời tab; nhận phản hồi thành công/lỗi rõ ràng.
6. Thử tự hạ quyền / tự khóa Admin: bị chặn ở giao diện và API.
7. Đăng xuất hoặc token hết hạn, tải lại trang: xuất hiện trang đăng nhập, **không tự đăng nhập Demo**.
8. Nhấn nút Demo: mới đăng nhập tài khoản Demo.
9. Dừng máy chủ hoặc giả lập lỗi mạng khi đăng nhập: vẫn giữ email, xóa mật khẩu, báo lỗi.

## Mức kiểm tra đã làm ở môi trường tạo gói
- Phân tích mã nguồn và đối chiếu logic đăng nhập và phân quyền.
- Kiểm tra cú pháp TS/TSX bằng compiler transpilation (không cần `node_modules`).
- Kiểm tra tính toàn vẹn ZIP và tính hợp lệ `package.json`, `data/db.json`.
- **Không khẳng định** đã chạy `npm run lint`, `npm run build`, hay kiểm thử trình duyệt: `npm ci --offline` thất bại do npm cache thiếu `yallist`.

## Chạy trên Windows
```powershell
npm ci
npm run lint
npm run build
npm run dev
```
Sau khi chạy hãy thử đủ 9 tình huống trên trước khi xem đây là bản nghiệm thu.

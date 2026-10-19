# FinTrack VN – Rà soát mã nguồn, 10/10/2026

## Đã sửa trực tiếp trong source
1. **Sai email/mật khẩu:** giữ nguyên email; xóa mật khẩu (và xác nhận nếu đăng ký); hiển thị lỗi trong biểu mẫu, focus về mật khẩu. Trình duyệt không áp yêu cầu 6 ký tự khi đăng nhập.
2. **Đăng nhập Demo:** không còn tự đăng nhập khi chưa có phiên; chỉ vào Demo khi người dùng chủ động bấm nút.
3. **Admin:** khôi phục tab sau khi tải lại; các nút thao tác dùng `type="button"`; chặn thao tác gửi lặp liên tục; có phản hồi lỗi/thành công; hạn chế tự hạ quyền/khóa tài khoản và khóa quản trị viên cuối cùng.
4. **Danh mục chung:** chặn tên trùng giữa các danh mục đang hoạt động cùng loại, cả lúc thêm và sửa; kiểm tra giới hạn tên 2–80 ký tự.
5. **Giao dịch:** khi đổi Thu/Chi sẽ chuyển sang danh mục hợp lệ nếu lựa chọn cũ không tương thích; loại bỏ số tiền NaN hoặc Infinity.
6. **Độ an toàn dữ liệu:** đọc `db.json` lỗi không bị hiểu nhầm thành dữ liệu rỗng; ghi JSON qua tệp tạm và đổi tên, lỗi ghi file được báo thay vì bỏ qua.

## Kiểm tra tự động đã thực hiện
- Đọc và phân tích cú pháp 51 file TS/TSX: **PASS**.
- 13 phép kiểm tra hồi quy dựa trên mã nguồn cho form đăng nhập, điều hướng Admin, khóa thao tác, kiểm tra quyền, kiểm tra danh mục và lưu dữ liệu: **PASS**.
- `package.json`, `data/db.json`: JSON hợp lệ.
- ZIP: kiểm tra CRC và đường dẫn tệp hợp lệ.

**Giới hạn quan trọng:** PASS ở trên chỉ là kiểm tra cú pháp/mã tĩnh, không phải chạy API hoặc thao tác trình duyệt. Chưa xác minh `npm run lint`, `npm run build`, đăng nhập sai thực tế, sửa quyền Admin, tạo danh mục trên browser vì môi trường dựng không có đầy đủ dependency cài đặt được.

## Các mục chưa hoàn thiện, không được xem là PASS
- Danh mục chung Admin **chưa tự đồng bộ** vào ô chọn danh mục của người dùng: form giao dịch vẫn dùng `CATEGORIES` cố định. Cần nối API danh mục chung và thống nhất với danh mục hiện có trước khi tuyên bố triển khai xong chức năng.
- `db.json` là lưu trữ file nội bộ phù hợp demo; chưa có giao dịch đa tiến trình/locking để đảm bảo thao tác đồng thời. Không phù hợp triển khai nhiều server.
- Chưa xác nhận kiểm thử thực tế cho ngân sách, tiết kiệm, định kỳ, báo cáo thống kê, đổi mật khẩu, thông báo và trên thiết bị di động.
- Chưa chạy `npm audit` trong môi trường có thể truy cập npm registry; không khẳng định thư viện hết lỗ hổng.

## Thay project không làm mất tài khoản
`data/db.json` trong ZIP là cơ sở dữ liệu trắng, tránh chia sẻ mật khẩu băm/dữ liệu cá nhân trong gói mã. **Sao lưu file `data/db.json` từ project đang chạy rồi chép lại vào thư mục `data/` sau khi giải nén bản mới.** Nếu giữ file đó, không cần tạo lại Admin.

## Các lệnh kiểm tra trên Windows PowerShell
```powershell
npm ci
npm run lint
npm run build
npm run dev
```

## Ca kiểm thử thực tế đề nghị
1. Email đúng/mật khẩu sai: email giữ nguyên, mật khẩu bị xóa, báo lỗi, không đổi trang.
2. Email không tồn tại: kết quả như trên.
3. Đăng nhập đúng User/Admin: vào đúng vai trò, giữ token sau F5; đăng xuất quay về form login, không tự login Demo.
4. Admin đổi quyền/sửa tên/khóa/mở khóa: ở nguyên tab Người dùng, có thông báo; User không được truy cập API Admin.
5. Admin thêm/sửa tên trùng, tắt/bật danh mục: báo lỗi đúng nếu trùng, không rời tab.
6. Thử khóa Admin duy nhất và tự hạ quyền: Back-end từ chối.
7. User nhập giao dịch số tiền 0, âm, không hợp lệ; chuyển giữa Thu và Chi: xử lý đúng, không chọn sai danh mục.
8. Các chức năng ngân sách, tiết kiệm, chi phí định kỳ, thống kê theo ngày: thử tạo/sửa/xóa và reload để kiểm tra dữ liệu không mất.
9. Thử mất kết nối server ở form đăng nhập và chức năng Admin: có lỗi rõ ràng, không mất form dữ liệu ngoài mật khẩu.

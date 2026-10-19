# Đồng bộ biểu tượng danh mục – 19/10/2026

- Thêm `src/components/common/CategoryIcon.tsx`: ánh xạ một lần các tên icon đã có trong `src/utils/categories.ts` sang icon Lucide.
- Ngân sách: thay chữ cái đầu tên danh mục bằng biểu tượng cùng màu sắc như mẫu tham khảo.
- Sổ giao dịch: thay chấm màu bên cạnh danh mục bằng icon phù hợp.
- Chi phí định kỳ: đồng bộ icon cho thẻ trên điện thoại và bảng trên máy tính.
- Dashboard: dùng cùng icon ở giao dịch gần đây, tóm tắt ngân sách và hóa đơn đến hạn.
- Báo cáo theo kỳ: dùng cùng icon bên cạnh tên danh mục.
- Với mã danh mục chưa được định nghĩa, giao diện dùng icon `Tag` mặc định; không phá vỡ dữ liệu cũ.

## Giới hạn kiểm tra

Đã kiểm tra cú pháp 60 tệp TypeScript/TSX bằng TypeScript parser. Chưa kiểm thử toàn bộ runtime/build hoặc giao diện trong trình duyệt ở môi trường này.

## Kiểm thử trên máy

```powershell
npm install
npm run lint
npm test
npm run build
npm run dev
```

Cấu hình `JWT_SECRET` an toàn trong `.env` trước khi chạy server. Không chép secret vào mã nguồn hoặc chia sẻ lên Git.

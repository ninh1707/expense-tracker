# FinTrack VN — Design System v1 (Presentation Only)

## Phạm vi
Bản này chuẩn hóa lớp CSS hiện có, **không đổi** state, handler, endpoint, route, payload, validate, JSX component hoặc logic Recharts.

## Màu sắc (CSS custom properties tại `src/index.css`)

| Vai trò | Token | Mã | Sử dụng |
|---|---|---|---|
| Chính / Thu nhập / Lưu | `--ft-primary` | `#059669` | Nút lưu và giá trị thu nhập |
| Chính hover | `--ft-primary-hover` | `#047857` | Trạng thái hover chủ đạo |
| Nguy hiểm / Chi tiêu / Xóa | `--ft-danger` | `#e11d48` | Xóa và trạng thái chi tiêu |
| Số dư / Thông tin | `--ft-info` | `#2563eb` | Số dư và thông tin |
| Cảnh báo | `--ft-warning` | `#d97706` | Hạn mức, đến hạn |
| Nền | `--ft-canvas` | `#f6f9fc` | Nền trang |
| Bề mặt | `--ft-surface` | `#ffffff` | Card và panel |
| Chữ chính | `--ft-ink` | `#14213c` | Nội dung |
| Chữ phụ | `--ft-muted` | `#64748b` | Mô tả |
| Viền | `--ft-border` | `#e2e8f0` | Input, card |

**Lưu ý:** Nhãn và chú thích của **danh mục** dùng màu phân loại khác nhau trong `src/utils/categories.ts`, không phải màu trạng thái. Không ép tất cả các danh mục thành xanh lá. Phần mapping API danh mục hiện còn fallback theo vị trí, cần kiểm tra nghiệp vụ màu trước khi sửa.

## Typography
- Font thống nhất: Inter (nếu đã có tại máy), hệ thống fallback `ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif`. Không thêm dependency font.
- Headings dùng weight 700/800, letter spacing `-.025em`; text dùng CSS/Tailwind gốc. Chưa ép lại kích cỡ heading vì có thể ảnh hưởng layout hiện hữu.
- Bảng số dùng `tabular-nums` để tránh nhảy độ rộng theo dữ liệu.

## Spacing, Radius, Shadow
- Spacing: `--ft-space-1/2/3/4/6/8` = 4/8/12/16/24/32px.
- Radius: `--ft-radius-sm/md/lg/xl` = 8/12/16/20px.
- Shadow: `--ft-shadow-sm/md/lg`; chỉ định dạng hiển thị, không tác động tương tác.

## Thành phần hiện có và quy tắc
- **Button:** Tailwind gốc điều khiển màu theo ngữ nghĩa; CSS chung bổ sung focus-visible và disabled. Không đổi onClick hoặc type.
- **Input/Select/Textarea:** Border/size gốc; cùng quy tắc focus, disabled và placeholder.
- **Card:** Kế thừa shadow-md và viền thống nhất khi đã dùng `rounded-xl`/`rounded-2xl` + `bg-white`.
- **Table:** Header nền nhạt, row hover nhẹ, chữ số tabular.
- **Modal:** Giữ z-index, trap focus, backdrop và nút đóng như code gốc; không override position/overflow.
- **Badge:** Màu semantic từ Tailwind gốc; chưa can thiệp data-to-color mapping.
- **Toast:** Giữ loại thông báo và thời gian hiển thị gốc, không can thiệp logic.
- **Icons:** Code gốc sử dụng `lucide-react`; không thêm bộ icon khác.

## Những điều không được khẳng định nếu chưa kiểm thử thực tế
- Không xác nhận biểu đồ đã hết trống chỉ vì đặt chiều cao vùng chứa.
- Không xác nhận Console sạch hoặc responsive đủ 360, 768, 1024, 1440 px khi chưa mở được ứng dụng trong trình duyệt.
- Không sử dụng ảnh AI làm bằng chứng screenshot phần mềm.

## Checklist nghiệm thu cần chạy trên máy
1. `npm install`, `npm run lint`, `npm run build`, `npm test`, `npm run dev`.
2. Ở 360/768/1024/1440 px: Dashboard, Transactions, Budgets, Savings, Recurring, Reports, Settings, Admin.
3. Kiểm tra 2 biểu đồ trên Dashboard và đồ thị Reports với dữ liệu thực.
4. Test form Thêm/Sửa/Xóa, lọc, modal, select category, thông báo, keyboard focus.
5. Kiểm tra F12 Console và Network với quyền User và Admin.
6. Kiểm tra tiếng Việt và màu sắc danh mục tương ứng giữa form và báo cáo.

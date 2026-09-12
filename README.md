# ĐỒ ÁN KỲ - WEBSITE QUẢN LÝ CHI TIÊU CÁ NHÂN

<p align="center">
  <strong>FinTrack VN</strong>
</p>

<p align="center">
  <strong>Quản lý chi tiêu thông minh</strong>
</p>

<p align="center">
  Website hỗ trợ quản lý tài chính cá nhân, theo dõi thu nhập - chi tiêu,
  lập ngân sách, quản lý mục tiêu tiết kiệm, các khoản thanh toán định kỳ
  và xem báo cáo tài chính trực quan.
</p>

---

## 1. THÔNG TIN ĐỒ ÁN

| Nội dung | Thông tin |
|---|---|
| Họ và tên | Nguyễn Khánh Ninh |
| MSSV | 523100042 |
| Lớp | 523100A |
| Khoa | Công nghệ số & Truyền thông |
| Trường | Đại học Phương Đông |
| Giảng viên hướng dẫn | Nguyễn Thị Đoan Trang |
| Tên đề tài | Xây dựng website quản lý chi tiêu cá nhân |
| Tên sản phẩm | FinTrack VN |

---

## 2. GIỚI THIỆU ĐỀ TÀI

Trong cuộc sống hiện nay, việc quản lý thu nhập và chi tiêu cá nhân đóng vai trò quan trọng trong việc kiểm soát tình hình tài chính. Tuy nhiên, việc ghi chép thủ công hoặc theo dõi các khoản thu chi bằng nhiều công cụ khác nhau có thể gây khó khăn cho người sử dụng.

Từ nhu cầu đó, đề tài **"Xây dựng website quản lý chi tiêu cá nhân"** được thực hiện nhằm xây dựng một hệ thống hỗ trợ người dùng quản lý các khoản thu nhập, chi tiêu và kế hoạch tài chính cá nhân trên một nền tảng tập trung.

Sản phẩm **FinTrack VN** cung cấp các chức năng chính như:

- Quản lý giao dịch thu nhập và chi tiêu.
- Thiết lập và theo dõi ngân sách.
- Xây dựng mục tiêu tiết kiệm.
- Quản lý các khoản chi phí định kỳ.
- Theo dõi tổng quan tình hình tài chính.
- Thống kê và trực quan hóa dữ liệu bằng biểu đồ.
- Quản lý tài khoản người dùng.
- Hỗ trợ giao diện responsive.
- Hỗ trợ thay đổi đơn vị tiền tệ và ngôn ngữ.

---

## 3. MỤC TIÊU ĐỀ TÀI

### 3.1. Mục tiêu tổng quát

Xây dựng một website quản lý tài chính cá nhân có giao diện trực quan, dễ sử dụng và có khả năng hỗ trợ người dùng theo dõi, phân tích và kiểm soát tình hình thu chi cá nhân.

### 3.2. Mục tiêu cụ thể

- Xây dựng chức năng đăng ký và đăng nhập người dùng.
- Xây dựng cơ chế xác thực bằng JWT.
- Xây dựng chức năng thêm, sửa, xóa và xem các giao dịch.
- Cho phép phân loại các khoản thu nhập và chi tiêu.
- Cho phép tìm kiếm và lọc giao dịch.
- Xây dựng chức năng thiết lập ngân sách theo danh mục.
- Theo dõi mức độ sử dụng ngân sách.
- Xây dựng chức năng tạo và quản lý mục tiêu tiết kiệm.
- Xây dựng chức năng quản lý các khoản chi phí định kỳ.
- Xây dựng dashboard tổng quan tình hình tài chính.
- Xây dựng các báo cáo và biểu đồ thống kê.
- Lưu trữ dữ liệu bằng MongoDB và hỗ trợ cơ chế lưu trữ dự phòng.
- Xây dựng giao diện responsive trên các kích thước màn hình khác nhau.
- Kiểm tra và đánh giá các chức năng của hệ thống.

---

## 4. CHỨC NĂNG CHÍNH

### 4.1. Đăng ký và đăng nhập

Hệ thống cung cấp:

- Đăng ký tài khoản.
- Đăng nhập bằng email và mật khẩu.
- Mã hóa mật khẩu bằng `bcryptjs`.
- Xác thực người dùng bằng JWT.
- Lấy thông tin hồ sơ người dùng.
- Cập nhật thông tin cá nhân.
- Đổi mật khẩu.
- Đăng xuất.

---

### 4.2. Dashboard - Tổng quan

Dashboard cung cấp cái nhìn tổng quan về tình hình tài chính của người dùng.

Các thông tin được hiển thị gồm:

- Tổng thu nhập.
- Tổng chi tiêu.
- Số dư còn lại.
- Tỷ lệ tích lũy.
- Xu hướng thu nhập và chi tiêu.
- Phân bổ chi tiêu theo danh mục.
- Các thông tin thống kê tài chính.

Dashboard được cập nhật lại dữ liệu khi người dùng thực hiện các thao tác thay đổi giao dịch, ngân sách, mục tiêu tiết kiệm hoặc chi phí định kỳ.

---

### 4.3. Quản lý giao dịch

Người dùng có thể quản lý các giao dịch thu nhập và chi tiêu.

Các thao tác chính:

- Thêm giao dịch.
- Sửa giao dịch.
- Xóa giao dịch.
- Xem danh sách giao dịch.
- Phân loại giao dịch.
- Tìm kiếm giao dịch.
- Lọc giao dịch theo điều kiện.
- Lựa chọn phương thức thanh toán.
- Gắn thẻ cho giao dịch.
- Quản lý ngày thực hiện giao dịch.

Một số nhóm giao dịch được sử dụng trong hệ thống:

**Thu nhập:**

- Lương.
- Freelance.
- Đầu tư.
- Các khoản thu nhập khác.

**Chi tiêu:**

- Hóa đơn.
- Ăn uống.
- Mua sắm.
- Di chuyển.
- Giải trí.
- Giáo dục.
- Sức khỏe.

---

### 4.4. Quản lý ngân sách

Người dùng có thể thiết lập ngân sách cho từng danh mục chi tiêu.

Chức năng bao gồm:

- Tạo ngân sách.
- Cập nhật ngân sách.
- Xóa ngân sách.
- Theo dõi số tiền đã sử dụng.
- Theo dõi phần ngân sách còn lại.
- Thiết lập ngưỡng cảnh báo.
- Hiển thị mức độ sử dụng ngân sách.

Hệ thống sử dụng phần trăm sử dụng ngân sách để hỗ trợ người dùng nhận biết tình trạng chi tiêu.

---

### 4.5. Mục tiêu tiết kiệm

Chức năng mục tiêu tiết kiệm cho phép người dùng xây dựng kế hoạch tiết kiệm cho các mục tiêu cá nhân.

Thông tin mục tiêu gồm:

- Tên mục tiêu.
- Số tiền mục tiêu.
- Số tiền hiện tại.
- Thời hạn.
- Danh mục.
- Ghi chú.
- Tiến độ hoàn thành.

Người dùng có thể:

- Tạo mục tiêu.
- Chỉnh sửa mục tiêu.
- Xóa mục tiêu.
- Nạp tiền vào mục tiêu.
- Rút tiền khỏi mục tiêu.
- Theo dõi lịch sử thay đổi.
- Theo dõi phần trăm hoàn thành.

---

### 4.6. Quản lý chi phí định kỳ

Chức năng này hỗ trợ quản lý những khoản chi phí có tính lặp lại theo chu kỳ.

Ví dụ:

- Tiền thuê nhà.
- Tiền điện.
- Tiền nước.
- Internet.
- Các dịch vụ thuê bao.

Người dùng có thể:

- Tạo khoản chi phí định kỳ.
- Cập nhật thông tin.
- Xóa khoản chi phí.
- Theo dõi ngày đến hạn.
- Thiết lập số ngày nhắc trước.
- Xác nhận thanh toán.
- Tự động ghi nhận giao dịch theo cấu hình.

---

### 4.7. Báo cáo và thống kê

Hệ thống cung cấp các biểu đồ giúp người dùng dễ dàng theo dõi tình hình tài chính.

Các dạng dữ liệu được trực quan hóa gồm:

- So sánh thu nhập và chi tiêu.
- Xu hướng tài chính theo thời gian.
- Phân bổ chi tiêu.
- Các danh mục chi tiêu nhiều.
- Các chỉ số tổng quan.

Thư viện **Recharts** được sử dụng để xây dựng các biểu đồ trên giao diện.

---

### 4.8. Cài đặt

Người dùng có thể quản lý một số thiết lập cá nhân như:

- Thông tin tài khoản.
- Đơn vị tiền tệ.
- Ngôn ngữ.
- Mục tiêu thu nhập hàng tháng.
- Đổi mật khẩu.
- Đặt lại dữ liệu tài khoản.

---

## 5. CÔNG NGHỆ SỬ DỤNG

### 5.1. Front-end

| Công nghệ | Vai trò |
|---|---|
| React 19 | Xây dựng giao diện người dùng |
| TypeScript | Kiểm soát kiểu dữ liệu và phát triển mã nguồn |
| Tailwind CSS 4 | Xây dựng giao diện và responsive |
| Recharts | Xây dựng biểu đồ thống kê |
| Lucide React | Cung cấp hệ thống biểu tượng |
| Motion | Hỗ trợ hiệu ứng chuyển động |
| Vite | Công cụ phát triển và build Front-end |

### 5.2. Back-end

| Công nghệ | Vai trò |
|---|---|
| Node.js | Môi trường chạy JavaScript phía máy chủ |
| Express.js | Xây dựng Web Server và REST API |
| TypeScript | Phát triển mã nguồn Back-end |
| JWT | Xác thực người dùng |
| bcryptjs | Mã hóa và kiểm tra mật khẩu |

### 5.3. Database

| Công nghệ | Vai trò |
|---|---|
| MongoDB | Lưu trữ dữ liệu |
| Mongoose | Kết nối và thao tác với MongoDB |
| Embedded JSON Store | Cơ chế lưu trữ dự phòng khi không có MongoDB |

### 5.4. Công cụ

| Công cụ | Mục đích |
|---|---|
| Visual Studio Code | Viết và quản lý mã nguồn |
| Git | Quản lý phiên bản |
| GitHub | Lưu trữ source code và theo dõi tiến độ |
| npm | Quản lý package và dependencies |

---

## 6. KIẾN TRÚC HỆ THỐNG

FinTrack VN được xây dựng theo mô hình ứng dụng Web gồm Front-end, Back-end và Database.

Mô hình tổng quát:

```text
+----------------------+
|      Người dùng       |
+----------+-----------+
           |
           v
+----------------------+
|      React 19        |
|    TypeScript        |
|    Tailwind CSS      |
+----------+-----------+
           |
           | HTTP / REST API
           v
+----------------------+
|    Node.js /         |
|    Express.js        |
+----------+-----------+
           |
           +----------------------+
           |                      |
           v                      v
+----------------------+   +----------------------+
|     MongoDB          |   | JSON Storage/Fallback|
|     Mongoose         |   |                      |
+----------------------+   +----------------------+
```

### 6.1. Front-end

Front-end chịu trách nhiệm:

- Hiển thị giao diện.
- Điều hướng giữa các chức năng.
- Nhập dữ liệu từ người dùng.
- Gửi yêu cầu đến REST API.
- Nhận và hiển thị dữ liệu.
- Quản lý trạng thái giao diện.

### 6.2. Back-end

Back-end chịu trách nhiệm:

- Tiếp nhận request từ Front-end.
- Xác thực người dùng.
- Kiểm tra dữ liệu.
- Xử lý nghiệp vụ.
- Thực hiện CRUD.
- Truy vấn cơ sở dữ liệu.
- Trả kết quả về Front-end.

### 6.3. Database

Dữ liệu chính được tổ chức thành các nhóm:

- User.
- Transaction.
- Budget.
- Savings Goal.
- Recurring Payment.

---

## 7. CẤU TRÚC DỰ ÁN

Cấu trúc chính của project:

```text
expense-tracker/
│
├── public/
│   └── assets/
│
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Budgets/
│   │   ├── Dashboard/
│   │   ├── Recurring/
│   │   ├── Reports/
│   │   ├── Savings/
│   │   ├── Settings/
│   │   └── Transactions/
│   │
│   ├── contexts/
│   │   ├── AuthContext
│   │   ├── LanguageContext
│   │   └── NotificationContext
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── server/
│   ├── config/
│   │   └── db.ts
│   │
│   ├── middlewares/
│   │   └── authMiddleware.ts
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Transaction.ts
│   │   ├── Budget.ts
│   │   ├── SavingsGoal.ts
│   │   └── RecurringPayment.ts
│   │
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── transactionRoutes.ts
│   │   ├── budgetRoutes.ts
│   │   ├── savingsRoutes.ts
│   │   ├── recurringRoutes.ts
│   │   └── reportRoutes.ts
│   │
│   └── services/
│       ├── authService.ts
│       ├── budgetService.ts
│       ├── savingsService.ts
│       └── ...
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── server.ts
└── README.md
```

---

## 8. YÊU CẦU MÔI TRƯỜNG

Để chạy project, cần chuẩn bị:

- Node.js 20 trở lên.
- npm 10 trở lên.
- MongoDB nếu muốn sử dụng MongoDB làm cơ sở dữ liệu chính.
- Trình duyệt Web hiện đại.

Kiểm tra phiên bản Node.js:

```bash
node -v
```

Kiểm tra phiên bản npm:

```bash
npm -v
```

---

## 9. CÀI ĐẶT VÀ CHẠY PROJECT

### Bước 1: Clone repository

```bash
git clone https://github.com/ninh1707/expense-tracker.git
```

Di chuyển vào thư mục project:

```bash
cd expense-tracker
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình biến môi trường

Tạo file `.env` dựa trên `.env.example`.

Trên Windows:

```cmd
copy .env.example .env
```

Trên macOS/Linux:

```bash
cp .env.example .env
```

Cấu hình MongoDB nếu sử dụng MongoDB:

```env
MONGODB_URI=mongodb://localhost:27017/expense_tracker
```

Có thể thiết lập JWT secret:

```env
JWT_SECRET=your_secure_jwt_secret
```

> Không đưa file `.env`, API key, token, mật khẩu hoặc thông tin bảo mật vào GitHub.

### Bước 4: Chạy project ở môi trường development

```bash
npm run dev
```

Sau khi server khởi động, truy cập:

```text
http://localhost:3000
```

---

## 10. BUILD PROJECT

Để build project:

```bash
npm run build
```

Sau khi build thành công, có thể chạy phiên bản production bằng:

```bash
npm start
```

Để kiểm tra TypeScript:

```bash
npm run lint
```

---

## 11. CẤU HÌNH DATABASE

Project sử dụng MongoDB thông qua Mongoose.

Database mặc định trong file `.env.example`:

```text
mongodb://localhost:27017/expense_tracker
```

Các nhóm dữ liệu chính:

```text
User
 ├── thông tin tài khoản
 ├── email
 ├── mật khẩu đã mã hóa
 ├── currency
 ├── language
 └── monthlyIncomeTarget

Transaction
 ├── userId
 ├── type
 ├── amount
 ├── category
 ├── date
 ├── description
 ├── paymentMethod
 └── tags

Budget
 ├── userId
 ├── category
 ├── amount
 ├── period
 ├── month
 ├── alertThreshold
 └── notes

SavingsGoal
 ├── userId
 ├── name
 ├── targetAmount
 ├── currentAmount
 ├── deadline
 ├── category
 └── notes

RecurringPayment
 ├── userId
 ├── title
 ├── amount
 ├── category
 ├── frequency
 ├── nextDueDate
 ├── reminderDaysBefore
 └── status
```

Nếu không cung cấp `MONGODB_URI`, server có cơ chế lưu trữ dự phòng theo cấu hình của project.

---

## 12. XÁC THỰC NGƯỜI DÙNG

Project sử dụng JWT để xác thực người dùng.

Quy trình cơ bản:

```text
Người dùng
    |
    v
Đăng nhập
    |
    v
Express API
    |
    v
Kiểm tra email + mật khẩu
    |
    v
bcryptjs kiểm tra mật khẩu
    |
    v
Tạo JWT
    |
    v
Front-end lưu trạng thái xác thực
    |
    v
Gửi JWT khi truy cập API cần xác thực
```

JWT được sử dụng để xác định người dùng trong các thao tác liên quan đến dữ liệu cá nhân.

Mật khẩu người dùng không được lưu dưới dạng văn bản thuần túy mà được xử lý bằng `bcryptjs`.

---

## 13. REST API

Back-end cung cấp các nhóm API chính:

| Nhóm API | Chức năng |
|---|---|
| `/api/auth` | Đăng ký, đăng nhập, hồ sơ và xác thực |
| `/api/transactions` | Quản lý giao dịch |
| `/api/budgets` | Quản lý ngân sách |
| `/api/savings` | Quản lý mục tiêu tiết kiệm |
| `/api/recurring` | Quản lý chi phí định kỳ |
| `/api/reports` | Thống kê và báo cáo |
| `/api/health` | Kiểm tra trạng thái server |

Health check:

```http
GET /api/health
```

Kết quả thành công có dạng:

```json
{
  "status": "ok"
}
```

---

## 14. TÀI KHOẢN DEMO

### Tài khoản demo hiện tại của source code

> Lưu ý: thông tin dưới đây phải khớp với tài khoản demo được seed trong source code.

```text
Email: demo@taichinh.vn
Password: 123456
```

Tài khoản demo được hệ thống khởi tạo cùng với dữ liệu mẫu để có thể kiểm tra nhanh các chức năng của ứng dụng.

Dữ liệu mẫu bao gồm:

- Giao dịch thu nhập.
- Giao dịch chi tiêu.
- Ngân sách.
- Mục tiêu tiết kiệm.
- Chi phí định kỳ.

### Lưu ý

Thông tin tài khoản demo phía trên là **tài khoản hiện có trong source code**.

Nếu muốn sử dụng tài khoản:

```text
Email: demo@gmail.com
Password: demo123
```

cần cập nhật thông tin trong `server/services/authService.ts` trước khi sử dụng.

---

## 15. DỮ LIỆU DEMO

Project có cơ chế tạo dữ liệu mẫu cho tài khoản demo.

Một số dữ liệu mẫu được sử dụng để mô phỏng tình huống sử dụng thực tế:

### Thu nhập

- Lương.
- Thu nhập freelance.
- Cổ tức đầu tư.

### Chi tiêu

- Tiền thuê nhà.
- Điện và nước.
- Internet.
- Ăn uống.
- Di chuyển.
- Mua sắm.
- Giáo dục.
- Sức khỏe.
- Giải trí.

### Ngân sách

Dữ liệu mẫu có ngân sách cho một số nhóm như:

- Ăn uống.
- Hóa đơn.
- Mua sắm.
- Giải trí.
- Di chuyển.

### Mục tiêu tiết kiệm

Một số mục tiêu mẫu:

- Quỹ dự phòng.
- Mua thiết bị phục vụ công việc.
- Du lịch.

### Chi phí định kỳ

Ví dụ:

- Tiền thuê nhà.
- Hóa đơn điện.
- Gói dịch vụ giải trí.

---

## 16. CÁC MỐC TIẾN ĐỘ ĐỒ ÁN

Project được tổ chức và theo dõi theo 6 checkpoint chính.

### Checkpoint 01 - Đăng ký đề tài

**Nội dung:**

- Xác định tên đề tài.
- Xác định mục tiêu.
- Xác định phạm vi.
- Xác định công nghệ dự kiến.

**Trạng thái:**

Đã xác định đề tài và phạm vi chức năng chính.

**Commit đề xuất:**

```text
Chốt tên đề tài và phạm vi chức năng
```

---

### Checkpoint 02 - Phân tích

**Nội dung:**

- Phân tích bài toán.
- Xác định người dùng.
- Xác định yêu cầu chức năng.
- Xác định yêu cầu phi chức năng.
- Xác định dữ liệu đầu vào và đầu ra.
- Phân tích các luồng xử lý chính.

**Commit đề xuất:**

```text
Hoàn thành phân tích yêu cầu và use case
```

---

### Checkpoint 03 - Thiết kế

**Nội dung:**

- Thiết kế kiến trúc hệ thống.
- Thiết kế cơ sở dữ liệu.
- Thiết kế API.
- Thiết kế giao diện.
- Thiết kế luồng xử lý.

**Commit đề xuất:**

```text
Cập nhật ERD và thiết kế kiến trúc
```

---

### Checkpoint 04 - Triển khai

**Nội dung:**

- Xây dựng Front-end.
- Xây dựng Back-end.
- Xây dựng REST API.
- Xây dựng xác thực JWT.
- Xây dựng CRUD giao dịch.
- Xây dựng ngân sách.
- Xây dựng mục tiêu tiết kiệm.
- Xây dựng chi phí định kỳ.
- Xây dựng dashboard và báo cáo.

**Commit đề xuất:**

```text
Hoàn thành các chức năng chính của hệ thống
```

---

### Checkpoint 05 - Kiểm thử

**Nội dung:**

- Xây dựng test case.
- Kiểm tra các chức năng.
- Kiểm tra dữ liệu đầu vào.
- Kiểm tra xác thực.
- Kiểm tra CRUD.
- Kiểm tra các trường hợp lỗi.
- Sửa lỗi phát hiện trong quá trình kiểm thử.
- Đánh giá tính ổn định của hệ thống.

**Commit đề xuất:**

```text
Hoàn thành kiểm thử và sửa lỗi
```

---

### Checkpoint 06 - Báo cáo và Demo

**Nội dung:**

- Hoàn thiện báo cáo.
- Hoàn thiện README.
- Hoàn thiện source code.
- Chuẩn bị dữ liệu demo.
- Chuẩn bị video/demo.
- Tổng hợp kết quả.
- Đánh giá hạn chế.
- Đề xuất hướng phát triển.

**Commit đề xuất:**

```text
Hoàn thiện báo cáo và phiên bản cuối
```

---

## 17. QUY TRÌNH LÀM VIỆC VỚI GIT

Quy trình cập nhật source code:

```text
Pull / Fetch
     |
     v
Phát triển chức năng
     |
     v
Kiểm tra và chạy thử
     |
     v
Commit
     |
     v
Push lên GitHub
     |
     v
Ghi nhận Issue nếu có lỗi/vấn đề
```

Một số commit nên được chia theo từng giai đoạn thay vì chỉ commit một lần khi hoàn thành toàn bộ project.

Ví dụ:

```bash
git add .
git commit -m "Chốt tên đề tài và phạm vi chức năng"
git push
```

```bash
git add .
git commit -m "Hoàn thành phân tích yêu cầu và use case"
git push
```

```bash
git add .
git commit -m "Cập nhật ERD và thiết kế kiến trúc"
git push
```

```bash
git add .
git commit -m "Hoàn thành các chức năng chính của hệ thống"
git push
```

```bash
git add .
git commit -m "Hoàn thành kiểm thử và sửa lỗi"
git push
```

```bash
git add .
git commit -m "Hoàn thiện báo cáo và phiên bản cuối"
git push
```

---

## 18. KIỂM THỬ

Các nhóm chức năng cần được kiểm thử:

### 18.1. Authentication

- Đăng ký tài khoản mới.
- Đăng nhập đúng tài khoản.
- Đăng nhập sai mật khẩu.
- Đăng nhập email không tồn tại.
- Đăng xuất.
- Truy cập API khi chưa xác thực.
- Đổi mật khẩu.

### 18.2. Transaction

- Thêm giao dịch thu.
- Thêm giao dịch chi.
- Sửa giao dịch.
- Xóa giao dịch.
- Tìm kiếm giao dịch.
- Lọc giao dịch.
- Kiểm tra số tiền.
- Kiểm tra danh mục.
- Kiểm tra ngày giao dịch.

### 18.3. Budget

- Tạo ngân sách.
- Sửa ngân sách.
- Xóa ngân sách.
- Kiểm tra mức sử dụng ngân sách.
- Kiểm tra cảnh báo ngân sách.

### 18.4. Savings

- Tạo mục tiêu.
- Chỉnh sửa mục tiêu.
- Xóa mục tiêu.
- Nạp tiền.
- Rút tiền.
- Kiểm tra tiến độ.

### 18.5. Recurring Payment

- Tạo khoản chi phí định kỳ.
- Chỉnh sửa.
- Xóa.
- Kiểm tra ngày đến hạn.
- Xác nhận thanh toán.
- Kiểm tra việc ghi nhận giao dịch.

### 18.6. Reports

- Kiểm tra số liệu tổng hợp.
- Kiểm tra biểu đồ.
- Kiểm tra phân bổ chi tiêu.
- Kiểm tra dữ liệu theo thời gian.

---

## 19. AN TOÀN VÀ BẢO MẬT

Project áp dụng một số biện pháp cơ bản:

- Sử dụng JWT cho xác thực.
- Mật khẩu được mã hóa bằng `bcryptjs`.
- API có middleware xác thực.
- Dữ liệu được phân tách theo người dùng.
- Không lưu mật khẩu dạng plaintext.
- Sử dụng biến môi trường cho các thông tin cấu hình.
- Không đưa API key hoặc thông tin bảo mật lên GitHub.

Các file chứa thông tin nhạy cảm không được commit:

```text
.env
.env.local
node_modules/
dist/
```

File mẫu cấu hình:

```text
.env.example
```

được sử dụng để mô tả các biến môi trường cần thiết mà không chứa thông tin bảo mật thực tế.

---

## 20. GITHUB REPOSITORY

Source code của project được lưu trữ tại:

**GitHub:**

https://github.com/ninh1707/expense-tracker

Repository được sử dụng để:

- Lưu trữ source code.
- Theo dõi lịch sử phát triển.
- Ghi nhận tiến độ thông qua commit.
- Quản lý phiên bản.
- Lưu trữ tài liệu đồ án.
- Hỗ trợ trao đổi và đánh giá quá trình thực hiện.

---

## 21. DEMO / VIDEO

### Link demo website

```text
Chưa cập nhật
```

### Link video demo

```text
Chưa cập nhật
```

Sau khi có đường dẫn demo hoặc video, cập nhật trực tiếp vào phần này.

---

## 22. HƯỚNG PHÁT TRIỂN

Trong các phiên bản tiếp theo, hệ thống có thể được mở rộng theo các hướng:

- Hoàn thiện triển khai trên môi trường Internet.
- Cải thiện khả năng phân tích dữ liệu.
- Bổ sung nhiều loại báo cáo tài chính.
- Cải thiện hệ thống thông báo.
- Bổ sung tính năng nhập/xuất dữ liệu nâng cao.
- Tối ưu hiệu năng xử lý.
- Cải thiện trải nghiệm người dùng trên thiết bị di động.
- Bổ sung khả năng sao lưu và phục hồi dữ liệu.
- Nghiên cứu khả năng kết nối với các dịch vụ tài chính bên ngoài trong tương lai.

Các chức năng mở rộng chỉ được triển khai khi phù hợp với phạm vi và mục tiêu của đồ án.

---

## 23. HẠN CHẾ

Một số hạn chế của phiên bản hiện tại:

- Hệ thống chủ yếu phục vụ quản lý tài chính cá nhân.
- Chưa thực hiện kết nối trực tiếp với tài khoản ngân hàng thực tế.
- Chưa tích hợp cổng thanh toán thực tế.
- Dữ liệu demo được sử dụng để phục vụ việc kiểm thử và trình diễn.
- Khả năng phân tích tài chính vẫn có thể được mở rộng thêm trong các phiên bản sau.
- Việc triển khai production cần bổ sung thêm các cấu hình bảo mật và vận hành phù hợp.

---

## 24. TÁC GIẢ

**Nguyễn Khánh Ninh**

- MSSV: `523100042`
- Lớp: `523100A`
- Khoa: Công nghệ số & Truyền thông
- Trường: Đại học Phương Đông

**Đề tài:** Xây dựng website quản lý chi tiêu cá nhân

**Sản phẩm:** FinTrack VN - Quản lý chi tiêu thông minh

---

## 25. GHI CHÚ

Đây là sản phẩm được thực hiện trong khuôn khổ đồ án kỳ nhằm áp dụng các kiến thức về phân tích yêu cầu, thiết kế hệ thống, lập trình Web, cơ sở dữ liệu, kiểm thử và quản lý mã nguồn.

Source code được cập nhật theo từng giai đoạn để thể hiện quá trình phát triển của đồ án.

---
# QUY TẮC VÀ TIÊU CHUẨN PHÁT TRIỂN: WEATHER & TRAVEL PLANNER

## 1. Công nghệ & Giới hạn kỹ thuật
- **Ngôn ngữ thuần túy**: Chỉ sử dụng HTML5 Semantic, CSS3 và JavaScript thuần (Vanilla JS ES6+).
- **Tuyệt đối cấm**: Không sử dụng React, Vue, Angular, Svelte, TypeScript, Tailwind CSS, Bootstrap, jQuery, npm packages hoặc bất kỳ thư viện UI / framework bên ngoài nào.
- **Tách biệt mã nguồn**: HTML (`index.html`), CSS (`css/style.css`), và JavaScript (`js/script.js`) phải được tách thành các file độc lập.
- **Liên kết tài nguyên**: CSS và JS phải được nhúng qua external links/tags (`<link rel="stylesheet">`, `<script src="...">`). Không viết CSS inline trực tiếp vào HTML hoặc nhúng khối script/style lớn trong HTML; không sử dụng inline event handlers như `onclick="..."` trong HTML.
- **Dữ liệu & Quản lý trạng thái**:
  - Quản lý dữ liệu bằng Array, Object và JSON khi cần tuần tự hóa.
  - Sử dụng LocalStorage để lưu và khôi phục trạng thái ứng dụng.
  - Xử lý lỗi với `try...catch`, kiểm tra dữ liệu lỗi/trống và có phương án dự phòng khi LocalStorage không khả dụng.
  - Giữ dữ liệu gốc tách biệt với dữ liệu hiển thị (khi tìm kiếm, lọc, sắp xếp, phân trang).
- **Tính năng đặc thù**:
  - Dữ liệu thời tiết mô phỏng (không dùng API thời tiết thực tế).
  - Xuất file `.txt` bằng Blob và `URL.createObjectURL()`, giải phóng bằng `URL.revokeObjectURL()`.
  - Bộ đếm ngược Countdown sử dụng `setInterval` và `Date`, quản lý hủy interval cũ tránh rò rỉ bộ nhớ hoặc chạy trùng lặp.

## 2. Thiết kế & Trải nghiệm người dùng (UI/UX)
- **Phong cách Glassmorphism**:
  - Sử dụng các panel kính mờ với `backdrop-filter: blur(...)`.
  - Nền panel bán trong suốt (`rgba(...)` / `hsla(...)`).
  - Viền kính mảnh, bo góc lớn, đổ bóng mềm mại (soft shadows).
  - Typography rõ nét, độ tương phản cao, đảm bảo văn bản dễ đọc trên nền kính.
  - Có màu nền dự phòng (fallback background color) khi ảnh nền không khả dụng.
  - Hỗ trợ `prefers-reduced-motion` cho người dùng nhạy cảm với chuyển động.
- **Bố cục (Layout) & Responsive**:
  - Sử dụng Flexbox hoặc CSS Grid.
  - Desktop: Bố cục 2 cột (Cột trái: Thời tiết & Gợi ý; Cột phải: Form & Lịch trình).
  - Tablet/Mobile: Chuyển thành 1 cột, co giãn linh hoạt, không bị tràn ngang (horizontal scroll), nút bấm và trường nhập liệu thân thiện với thao tác chạm.
- **Trạng thái giao diện**:
  - Thiết kế đầy đủ các trạng thái: Bình thường, Hover, Active, Focus (dễ nhìn bằng bàn phím).
  - Trạng thái danh sách rỗng (Empty state) với hướng dẫn rõ ràng.
  - Trạng thái không tìm thấy kết quả tìm kiếm/lọc và nút xóa bộ lọc.
  - Thông báo phản hồi trực quan (thêm, sửa, xóa, lỗi hợp lệ form).
  - Không hiển thị nút/icon chỉ mang tính trang trí mà không có hành động thực tế.

## 3. Quy chuẩn danh sách dữ liệu (Data Listing)
- Mọi danh sách dữ liệu phải hỗ trợ:
  1. **Tìm kiếm**: Không phân biệt hoa thường, tìm kiếm chuỗi con theo tên địa điểm.
  2. **Lọc**: Tất cả, Chưa đến, Đã đến.
  3. **Sắp xếp**: Theo tên địa điểm (A-Z, Z-A) hoặc theo thời gian ghé thăm.
  4. **Phân trang**: Các kích thước trang gồm 10, 20, 50 và Tất cả.
- Thứ tự xử lý dữ liệu chuẩn:
  `Dữ liệu gốc` → `Tìm kiếm` → `Lọc` → `Sắp xếp` → `Phân trang` → `Hiển thị`.
- Luôn reset về trang 1 khi thay đổi từ khóa tìm kiếm, bộ lọc hoặc sắp xếp để tránh trạng thái trang rỗng do chỉ số trang cũ.
- Xử lý mượt mà animation khi thêm/xóa mục, đồng thời đảm bảo dữ liệu cập nhật an toàn, không bị kẹt khi tương tác nhanh.
- Tránh dùng `innerHTML` với dữ liệu do người dùng nhập; ưu tiên `createElement`, `textContent`, hoặc sanitization an toàn để chống XSS.

## 4. Quy trình làm việc & Quy tắc phê duyệt
- **Quy trình 6 bước**:
  1. Phân tích (kiểm tra cấu trúc và hiện trạng).
  2. Lập kế hoạch chi tiết (file tạo/sửa/xóa, logic, kiểm thử, rủi ro).
  3. Xin lựa chọn / phê duyệt từ người dùng.
  4. Thực hiện theo đúng phạm vi đã được phê duyệt.
  5. Kiểm thử toàn diện (chức năng, UI, responsive, LocalStorage, console).
  6. Báo cáo minh bạch kết quả.
- **Kỷ luật mã nguồn**:
  - Không tự ý thay đổi cấu trúc thư mục, tên file, tên class, ID hoặc API nội bộ đang thống nhất.
  - Không xóa hoặc ghi đè mã nguồn khi chưa thông báo và được chấp thuận.
  - Trước mọi thay đổi phải trình bày kế hoạch và chờ xác nhận.

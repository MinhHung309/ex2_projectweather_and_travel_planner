# Weather & Travel Planner ✈️🌤️

Ứng dụng web mô phỏng tra cứu thời tiết thông minh và quản lý lịch trình du lịch cá nhân. Được phát triển hoàn toàn bằng **HTML5 Semantic, CSS3 và Vanilla JavaScript (ES6+) thuần túy**, áp dụng phong cách thiết kế **Glassmorphism** hiện đại.

---

## 🌟 Tính Năng Nổi Bật

1. **Giao diện Glassmorphism Sang Trọng**:
   - Hiệu ứng kính mờ (`backdrop-filter: blur`), viền phản chiếu ánh sáng và đổ bóng mềm mại.
   - Bố cục 2 cột trực quan trên máy tính để bàn (Desktop) và tự động chuyển đổi 1 cột co giãn mượt mà trên Tablet / Mobile.
   - Màu sắc chủ đạo (Theme) tự động biến thiên theo điều kiện thời tiết (Nắng rực rỡ, Mưa se lạnh, Nhiều mây dịu mát).

2. **Mô Phỏng Thời Tiết & Gợi Ý Thông Minh (Smart Suggestions)**:
   - Dữ liệu mô phỏng chi tiết cho các điểm đến tiêu biểu: **Biên Hòa**, **Đà Lạt**, **Vũng Tàu**.
   - Cung cấp gợi ý trang phục và vật dụng du lịch thông minh dựa trên ngưỡng nhiệt độ và hiện tượng thời tiết.

3. **Quản Lý Lịch Trình Chuyến Đi (Itinerary Planner)**:
   - Thêm địa điểm kèm thời gian dự kiến (hỗ trợ phím Enter, kiểm tra tính hợp lệ dữ liệu).
   - Đánh dấu trạng thái **"Đã đến"** / **"Chưa đến"** kèm gạch ngang trực quan và thanh thống kê tiến độ %.
   - Xóa địa điểm với hiệu ứng trượt animation an toàn, không giật lag.

4. **Công Cụ Tìm Kiếm, Lọc, Sắp Xếp & Phân Trang Độc Lập**:
   - Tìm kiếm tên địa điểm gần đúng không phân biệt chữ hoa / thường.
   - Lọc theo trạng thái: Tất cả, Chưa đến, Đã đến.
   - Sắp xếp theo tên (A-Z, Z-A), thời gian ghé thăm, hoặc thời điểm mới thêm gần nhất.
   - Phân trang tùy chọn: 10, 20, 50 hoặc Tất cả các mục.

5. **Đồng Hồ Đếm Ngược Ngày Khởi Hành (Countdown Timer)**:
   - Đếm lùi chính xác theo Ngày, Giờ, Phút, Giây sử dụng `setInterval`.
   - Cơ chế dọn dẹp interval tự động ngăn ngừa rò rỉ bộ nhớ hoặc chạy trùng lặp.

6. **Xuất Lịch Trình Ra File Text (.txt)**:
   - Xuất toàn bộ dữ liệu lịch trình ra tệp văn bản tiếng Việt có dấu qua đối tượng `Blob` và `URL.createObjectURL()`.

7. **Lưu Trữ Tự Động (LocalStorage)**:
   - Tự động lưu và khôi phục nguyên vẹn trạng thái thành phố đang chọn, danh sách địa điểm và ngày khởi hành sau khi tải lại trang (F5).

---

## 🚀 Hướng Dẫn Chạy Ứng Dụng

Ứng dụng không yêu cầu cài đặt Node.js, npm hay bất kỳ web server phức tạp nào:

1. Tải về hoặc clone thư mục dự án về máy tính của bạn.
2. Mở trực tiếp file `index.html` bằng bất kỳ trình duyệt web hiện đại nào (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. Thưởng thức và trải nghiệm toàn bộ tính năng!

---

## 📂 Cấu Trúc Thư Mục

```text
Project_weather&travelplanner/
├── .skill/
│   └── skill.md               # Quy tắc và tiêu chuẩn phát triển dự án
├── css/
│   └── style.css              # Mã nguồn CSS3 giao diện và Glassmorphism
├── js/
│   └── script.js              # Mã nguồn JavaScript thuần (ES6+)
├── images/
│   └── README.md              # Thư mục hình ảnh dự án
├── video/
│   └── README.md              # Thư mục chứa video demo
├── reports/
│   └── technical-report.md    # Báo cáo kỹ thuật chi tiết
├── index.html                 # Cấu trúc HTML5 Semantic
└── README.md                  # Tài liệu hướng dẫn sử dụng
```

---

## 📄 Bản Quyền
Dự án được xây dựng phục vụ mục đích thực hành môn học HTML5, CSS3 và Vanilla JavaScript.

# BÁO CÁO KỸ THUẬT: ỨNG DỤNG WEATHER & TRAVEL PLANNER

## 1. Mục tiêu ứng dụng
Ứng dụng **Weather & Travel Planner** là một giải pháp web frontend mô phỏng tra cứu thông tin thời tiết thông minh kết hợp quản lý lịch trình du lịch cá nhân. Ứng dụng được xây dựng hoàn toàn bằng **HTML5 Semantic, CSS3 và Vanilla JavaScript (ES6+) thuần túy**, áp dụng ngôn ngữ thiết kế **Glassmorphism** hiện đại.

---

## 2. Cấu trúc thư mục dự án
```text
Project_weather&travelplanner/
├── .skill/
│   └── skill.md               # Bộ quy tắc và tiêu chuẩn phát triển dự án bắt buộc
├── css/
│   └── style.css              # Toàn bộ giao diện, theme, Glassmorphism và Responsive
├── js/
│   └── script.js              # Logic ứng dụng, mô phỏng thời tiết, CRUD, Storage, Timer, Export
├── images/
│   └── README.md              # Thư mục lưu trữ hình ảnh
├── video/
│   └── README.md              # Thư mục lưu trữ video demo
├── reports/
│   └── technical-report.md    # Báo cáo kỹ thuật chi tiết
├── index.html                 # Cấu trúc HTML5 Semantic chính
└── README.md                  # Hướng dẫn khởi chạy và sử dụng ứng dụng
```

---

## 3. Cấu trúc dữ liệu (Object & Array)
Ứng dụng tổ chức dữ liệu minh bạch, tách biệt giữa trạng thái lưu trữ (state) và dữ liệu hiển thị (view):

### 3.1. Dữ liệu thời tiết mô phỏng (`CITIES_DATA`)
Mảng các đối tượng chứa thông tin 3 thành phố:
```javascript
const CITIES_DATA = [
  {
    id: "bien-hoa",
    name: "Biên Hòa",
    temperature: 33,
    humidity: 68,
    windSpeed: 14,
    condition: "Nắng nhiều",
    conditionType: "sunny", // 'sunny' | 'rainy' | 'cloudy'
    icon: "☀️",
    description: "Thời tiết nắng nóng ban ngày..."
  },
  // Đà Lạt (17°C, rainy), Vũng Tàu (28°C, cloudy)
];
```

### 3.2. Cấu trúc một địa điểm du lịch (`Itinerary Item`)
Mỗi địa điểm trong lịch trình được quản lý bằng một đối tượng:
```javascript
{
  id: "loc_1710600000000_123",  // Định danh duy nhất dựa trên timestamp và số ngẫu nhiên
  title: "Quảng trường Lâm Viên", // Tên địa điểm (đã trim khoảng trắng)
  time: "08:30",                  // Thời gian dự kiến ghé thăm
  visited: false,                 // Trạng thái: false (Chưa đến) | true (Đã đến)
  createdAt: "2026-10-17T12:00:00.000Z" // Thời điểm tạo phục vụ sắp xếp mới nhất
}
```

---

## 4. Quản lý LocalStorage & Tuần tự hóa JSON
Ứng dụng sử dụng `localStorage` để lưu và khôi phục trạng thái hoàn toàn tự động sau mỗi thao tác có ý nghĩa:
- **`wtp_selected_city_id`**: Lưu `id` của thành phố đang được chọn.
- **`wtp_itinerary_items`**: Lưu danh sách địa điểm (Array).
- **`wtp_departure_date`**: Lưu chuỗi ngày khởi hành được chọn (`YYYY-MM-DD`).

### Cơ chế hoạt động:
- **Lưu dữ liệu**: Sử dụng `JSON.stringify(data)` chuyển đổi mảng/đối tượng thành chuỗi JSON trước khi gọi `localStorage.setItem(key, jsonString)`.
- **Đọc và khôi phục**: Sử dụng `localStorage.getItem(key)` và parse lại bằng `JSON.parse()`. Toàn bộ thao tác đều được bọc trong khối `try...catch` an toàn nhằm ngăn ngừa crash do dữ liệu JSON hỏng hoặc chế độ Private Browsing chặn quyền truy cập.

---

## 5. Kiến trúc Module và các hàm xử lý chính
Ứng dụng được đóng gói trong một IIFE (Immediately Invoked Function Expression) tự thực thi, chia thành 8 module rõ ràng:

1. **`StorageModule`**: Chuyên trách kiểm tra tính sẵn sàng của `localStorage`, lưu và tải dữ liệu an toàn.
2. **`WeatherModule`**: Quản lý sự kiện chọn thành phố từ `<select>`, cập nhật thông số nhiệt độ, độ ẩm, biểu tượng và tự động hoán đổi class theme trên thẻ `<body>` (`theme-sunny`, `theme-rainy`, `theme-cloudy`).
3. **`SmartSuggestionsModule`**: Đánh giá nhiệt độ và trạng thái thời tiết để đưa ra các gợi ý trang phục/vật dụng tương ứng (dưới 15°C, 15-20°C, 20-30°C, trên 30°C và yếu tố mưa/nhiều mây).
4. **`ItineraryModule`**: Xử lý thêm địa điểm (validate không rỗng), chuyển đổi trạng thái `visited`, xóa địa điểm với hiệu ứng trượt animation an toàn, dùng DOM API (`createElement`, `textContent`) chống tấn công XSS.
5. **`FilterSortPaginationModule`**: Quản lý luồng xử lý dữ liệu:
   $$\text{Dữ liệu gốc} \rightarrow \text{Tìm kiếm} \rightarrow \text{Lọc} \rightarrow \text{Sắp xếp} \rightarrow \text{Phân trang} \rightarrow \text{Hiển thị}$$
   Hỗ trợ phân trang kích thước 10, 20, 50 và Tất cả. Luôn đưa chỉ số trang về 1 khi người dùng đổi từ khóa hoặc bộ lọc.
6. **`CountdownModule`**: Đếm ngược đến ngày khởi hành (`YYYY-MM-DD 00:00:00` theo múi giờ địa phương), quản lý dọn dẹp interval bằng `clearInterval()` tránh tạo nhiều interval trùng lặp, xử lý mượt mà khi chuyến đi đã bắt đầu.
7. **`ExportModule`**: Tạo file `.txt` tiếng Việt có dấu sử dụng `Blob([content], { type: 'text/plain;charset=utf-8' })`, cấp phát đường link ảo bằng `URL.createObjectURL()` và giải phóng bộ nhớ ngay sau khi click bằng `URL.revokeObjectURL()`.
8. **`UIModule`**: Hiển thị thông báo trạng thái nổi (Toast Notification) với thời lượng tự động tắt sau 3.5 giây.

---

## 6. Hướng dẫn kiểm thử (Test Matrix)

| STT | Chức năng kiểm tra | Thao tác thực hiện | Kết quả mong đợi |
|---|---|---|---|
| 1 | Đổi thành phố | Chọn "Đà Lạt" hoặc "Vũng Tàu" trong dropdown | Nhiệt độ, icon, màu nền gradient thay đổi; gợi ý du lịch cập nhật ngay lập tức. |
| 2 | Thêm địa điểm rỗng | Để trống ô nhập và bấm "Thêm địa điểm" hoặc Enter | Báo lỗi màu đỏ "Vui lòng nhập tên địa điểm...", không cho thêm. |
| 3 | Thêm địa điểm hợp lệ | Nhập tên và giờ, bấm Enter | Địa điểm xuất hiện đầu danh sách, form được reset, toast thông báo thành công. |
| 4 | Đánh dấu đã đến | Click vào ô checkbox hoặc nút "Đã đến" | Tên bị gạch ngang, màu nền đổi sang xanh lục nhạt, cập nhật thanh tiến độ %. |
| 5 | Xóa địa điểm | Bấm nút "🗑️ Xóa" | Mục trượt sang phải rồi biến mất, danh sách cập nhật ngay. |
| 6 | Tìm kiếm & Lọc | Gõ từ khóa vào ô tìm kiếm hoặc chọn lọc "Chưa đến" | Danh sách lọc tức thì, phân trang tự tính lại. |
| 7 | Phân trang | Chọn kích thước "10", bấm nút "Sau >>" hoặc số trang | Hiển thị đúng dải số lượng mục và điều hướng chính xác. |
| 8 | Đếm ngược | Chọn một ngày trong tương lai ở ô ngày khởi hành | Đồng hồ hiển thị Ngày - Giờ - Phút - Giây đếm lùi liên tục. |
| 9 | Xuất file .txt | Bấm nút "Xuất lịch trình (.txt)" | Trình duyệt tải xuống file `.txt` có đầy đủ dấu tiếng Việt, thông tin thời tiết và các địa điểm. |
| 10 | Khôi phục trạng thái (F5) | Nhấn F5 tải lại trang | Toàn bộ thành phố đã chọn, ngày khởi hành và danh sách lịch trình vẫn giữ nguyên. |

---

## 7. Kịch bản Video Demo (Dành cho việc ghi hình)
1. **Bước 1**: Mở file `index.html` trực tiếp trên trình duyệt Google Chrome/Edge/Firefox.
2. **Bước 2**: Tại ô chọn thành phố, chuyển sang **"Đà Lạt"** -> Quan sát nhiệt độ chuyển thành 17°C, nền chuyển sang màu xanh trầm mưa và gợi ý trang phục áo khoác ấm.
3. **Bước 3**: Nhập địa điểm *"Thung Lũng Tình Yêu"*, chọn giờ *"09:00"*, bấm Enter để thêm vào lịch trình.
4. **Bước 4**: Thêm tiếp 2 địa điểm khác (ví dụ: *"Hồ Tuyền Lâm"*, *"Chợ đêm Đà Lạt"*).
5. **Bước 5**: Bấm vào checkbox hoặc nút *"Đã đến"* tại một địa điểm để minh họa chuyển trạng thái.
6. **Bước 6**: Gõ chữ *"Chợ"* vào ô tìm kiếm để kiểm tra chức năng lọc tức thì.
7. **Bước 7**: Bấm nút *"Xuất lịch trình (.txt)"* và mở file vừa tải về để kiểm tra nội dung.
8. **Bước 8**: Chọn ngày khởi hành trong tương lai tại góc trên bên phải để kích hoạt bộ đếm ngược.
9. **Bước 9**: Nhấn **F5** để tải lại trang -> Xác nhận toàn bộ dữ liệu lịch trình, thành phố và đồng hồ đếm ngược được khôi phục chính xác từ LocalStorage.

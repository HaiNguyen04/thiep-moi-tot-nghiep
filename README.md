# Thiệp mời tốt nghiệp dạng vé máy bay · Nguyễn Ngọc Hải

Website thiệp mời tốt nghiệp HCMUT 2026. Thiết kế lấy cảm hứng từ vé máy bay, dùng tốt trên điện thoại. Phần xem thiệp và bản đồ chạy tĩnh; tính năng **tạo mã khách mời ngắn ?k=LMT** kết nối API lưu mã riêng.

## Chạy ngay

**Cách 1:** Mở file `dist/index.html` bằng Chrome, Edge hoặc Safari (nhấp đúp file). Không cần cài Node.js, Python hoặc bất cứ thư viện nào.

**Cách 2:** Dùng VS Code > mở thư mục `dist` > chọn `index.html` > Open with Live Server (nếu đã cài extension).

## Tính năng

- Tên khách mời lấy từ URL cũ `?guest=My%20Na` hoặc link rút gọn chỉ một tham số (`?m=MTU.e.TWluaCBUaMawxqFuZw`)
- Màn hình mở đầu bảng **DEPARTURES** với hiệu ứng lật từng ô, vé màu kem có nút “Kéo xuống hoặc chạm để xé vé”; mở thiệp chính sau khi xé vé.
- Countdown đến 15:00 ngày 27/11/2026 (giờ Việt Nam, UTC+7)
- Lịch chính thức: chụp ảnh trước lễ 10:30–14:30, làm lễ 15:00–16:30, chụp ảnh sau lễ 16:30–17:30
- Số điện thoại liên hệ: 0948 637 877; vị trí hẹn chụp ảnh cần xác nhận với Hải
- Ảnh logo BK, ảnh chân dung và bản đồ khuôn viên được sử dụng từ **đúng file gốc Hải cung cấp** (không AI chỉnh ảnh)
- Hai tuyến đường vẽ SVG trên bản đồ thật: Cổng 1 → PIN điểm hẹn (xanh dương) và Cổng 3 → PIN điểm hẹn (xanh lá), tự đổi đích khi đặt lại PIN
- Mũi tên chuyển động theo đường đi, có thể bật riêng từng tuyến hoặc hiển thị cả hai
- Tên đường Lý Thường Kiệt và Tô Hiến Thành có nhãn tương phản cao; bản đồ có nhãn Cổng 1, 2 và 3
- Cảnh báo rõ **Cổng 2 chỉ dành cho giáo viên**; khách mời nên sử dụng Cổng 1 hoặc Cổng 3
- Bốn thẻ hướng dẫn chi tiết: điểm hẹn góc phải sân banh; bãi xe 1 phía Lý Thường Kiệt; bãi xe 2 sau B10; hội trường A5. Các mô tả bãi xe lặp đã được gộp lại.
- Nhãn riêng màu tím cho tòa A5 và hai bãi xe P (bãi 2 nằm sau tòa B10)
- Toàn bộ chữ giao diện đã Việt hóa, sử dụng font **Be Vietnam Pro** hỗ trợ dấu tiếng Việt và Arial dự phòng
- Lộ trình học vị hiển thị `STU – Sinh viên` → `B.Eng – Cử nhân Điện tử - Viễn thông`
- Nút phóng to bản đồ; đóng bằng nút ✕, click nền tối hoặc Escape
- Tab sơ đồ trường / điểm hẹn
- Đặt PIN điểm hẹn trực tiếp trên bản đồ (mở `?builder=1`), chỉ ghi tọa độ rút gọn vào link khi khác vị trí mặc định
- Nhạc nền từ file `assets/music.mp3` do Hải cung cấp, mặc định thử phát ngay khi tải trang; nếu trình duyệt chặn autoplay có tiếng, nhạc bắt đầu ở lần chạm/click/phím đầu tiên. Có nút bật/tắt và chỉnh âm lượng.
- Google Maps chỉ đường
- Xuất lịch `.ics` để thêm vào ứng dụng Calendar
- Chia sẻ bằng Web Share API (mobile) hoặc sao chép link
- Công cụ tạo đường dẫn cho nhiều khách mời: thêm `?builder=1` vào URL
- Trong công cụ tạo link: chọn xưng hô Bạn/Anh/Chị/Em/Cô/Chú/Gia đình/Thầy, nhập tên để có mã như **NNH**, **LMT**, **NNH2** nếu trùng mã với người khác.
- Link `?k=MÃ` chỉ chứa mã ngắn; tên, xưng hô và PIN được tra từ API được cấp riêng cho thiệp.

## Tùy biến

1. Mở `dist/index.html` để sửa tên, giờ, địa điểm, lời nhắn.
2. Mở `dist/script.js`, sửa đối tượng `CONFIG` nếu có thay đổi thời gian, địa điểm hoặc nội dung thêm lịch.
3. Ảnh gốc của Hải hiện là `dist/assets/hai-avatar.png`; logo là `dist/assets/hcmut-logo.png`. Có thể thay file cùng tên để cập nhật mà không phải sửa HTML.
4. Bản đồ gốc hiện là `dist/assets/hcmut-campus-map.png`. Nếu thay bản đồ khác, cần cập nhật lại tọa độ hai đường SVG (`path-gate1`, `path-gate3`) trong `dist/index.html` theo ảnh mới. Các tuyến đường hiện tại **gợi ý định hướng dựa trên hình**, chưa được xác minh thực địa; vui lòng kiểm tra lối đi trước khi gửi cho khách mời.
5. Nút Google Maps đang mở đường tìm kiếm đến Hội trường A5 tại 268 Lý Thường Kiệt. Hãy tự kiểm tra địa điểm trước khi gửi thư mời.
6. Lịch `.ics` sử dụng thời gian làm lễ từ 15:00 đến 16:30 (90 phút). Có thể sửa `eventDurationMinutes` trong `CONFIG` nếu lịch thay đổi.

## Tạo link cá nhân hóa

Nếu website ở `https://username.github.io/graduation/`:

```text
https://username.github.io/graduation/?guest=My%20Na
https://username.github.io/graduation/?guest=Ph%C3%BAc%20H%E1%BA%ADu
```

Hoặc mở `https://username.github.io/graduation/?builder=1` để tạo link.

Nhập **mã quản trị** được cấp riêng, chọn xưng hô và nhập họ tên. Bấm **Tạo & sao chép link cá nhân**. Ví dụ:

- **Lê Minh Thương** → `?k=LMT`
- **Nguyễn Ngọc Hải** → `?k=NNH`
- Nếu đã có mã khác cùng chữ cái đầu → `?k=NNH2` hoặc `?k=LMT2`

Mã quản trị không nằm trong URL gửi khách, chỉ lưu cục bộ ở trình duyệt Hải sau khi tạo mã thành công. Nên dùng tính năng này trên thiết bị riêng của Hải; không chia sẻ mã quản trị. Dữ liệu tên khách, xưng hô và điểm PIN được lưu trên dịch vụ API riêng. Link `?m=...` đời cũ và các tham số `?guest=...` vẫn đọc được.

**Lưu ý khi triển khai sang domain khác:** cần cập nhật `INVITE_API_BASE` trong `dist/script.js` và cho phép domain mới ở `INVITATION_ORIGIN` trong backend. Nếu chỉ tải thư mục `dist` lên GitHub Pages mà không triển khai API, thiệp thường và link cũ vẫn hoạt động, nhưng tính năng tạo/tra cứu `?k=...` sẽ không hoạt động.

### Tự đánh dấu điểm hẹn trên bản đồ

1. Mở website kèm `?builder=1` (nếu URL đã có dấu `?`, thêm `&builder=1`).
2. Nhấn **Chấm PIN trực tiếp trên bản đồ**, sau đó click vào điểm hẹn trên bản đồ phóng to.
3. Nhập tên địa điểm, ví dụ “Góc bên phải sân banh”.
4. Nhấn **Lưu & sao chép link có PIN**. Nếu dùng điểm hẹn mặc định, link không mang tọa độ; điểm hẹn riêng dùng tham số `p` ngắn.
5. Dùng công cụ tạo link khách mời bên dưới. Tọa độ và tên điểm hẹn được lưu cùng mã trên máy chủ, vì vậy link gửi khách chỉ cần `?k=MÃ`.

Lưu ý: Điểm hẹn mặc định được đặt gần sân banh theo ảnh Hải gửi. Khi tạo mã khách mời qua công cụ, PIN được lưu vào API. Thay đổi PIN rồi tạo lại cùng tên và xưng hô có thể sinh mã hậu tố mới để không ghi đè đường dẫn cũ.

## Đăng lên GitHub Pages miễn phí

1. Tạo GitHub repository public, ví dụ `graduation`.
2. Upload **toàn bộ nội dung bên trong thư mục `dist/`** vào thư mục gốc repository (đặc biệt là `index.html`, `style.css`, `script.js`, `assets/`).
3. Trong GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**.
4. Chọn branch `main`, folder `/(root)`, rồi Save.
5. Link thường có dạng `https://username.github.io/graduation/`.

## Cấu trúc

```text
dist/
├── index.html
├── style.css
├── script.js
└── assets/
    ├── favicon.svg
    ├── hai-avatar.png
    ├── hcmut-logo.png
    ├── hcmut-campus-map.png
    ├── music.mp3
    ├── portrait-placeholder.svg (dự phòng)
    └── campus-illustration.svg (dự phòng)
```

Website không yêu cầu khách đăng nhập. Những link cũ có tên mã hóa hoặc tên thường trong URL có thể hiện trong lịch sử; link `?k=MÃ` không chứa tên nhưng tên và xưng hô được lưu ở API để hiển thị cho người nhận.

**Lưu ý:** Logo trong header nay sử dụng đúng file Hải gửi. Đường đi SVG là lớp phủ động, không thay đổi hay vẽ lại ảnh bản đồ nền.

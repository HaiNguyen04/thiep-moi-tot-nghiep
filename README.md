# Thiệp tốt nghiệp Hải — Bách Khoa Premium V10.1

Bản hoàn chỉnh từ **V9 + chỉnh sửa quản trị V10**, thêm 3 kiểu lời mời, xưng hô, caption tùy chỉnh và API mã khách mời ngắn.

## Chạy ngay trên máy

**Cần Node.js LTS (phiên bản 20+).** Không phải cài thêm package nào.

- Windows: nhấp đúp `start_windows.bat`.
- Mac/Linux: chạy `./start_mac_linux.sh` (hoặc `node server/server.mjs`).
- Mở `http://localhost:3000/` để xem thiệp.
- Mở `http://localhost:3000/?builder=1` để tạo thiệp.

Khi khởi chạy lần đầu, terminal **tự sinh mã quản trị mới** và in dòng `MÃ QUẢN TRỊ`. Mã này được lưu ở `server/private/admin-key.txt`. Giữ file đó bí mật, không đưa lên GitHub. Các lần chạy tiếp theo dùng đúng mã cũ.

Chú ý: **mã quản trị cũ của website V10 online không tự dùng được trên server mới**. API online cũ vẫn là một dịch vụ độc lập. Muốn dùng API online mới, cần triển khai `server/server.mjs` tại một dịch vụ Node có lưu trữ bền vững (và thiết lập mã quản trị qua biến môi trường `INVITE_ADMIN_KEY`).

## Tạo thiệp theo xưng hô và lời nhắn

1. Chọn lời mời **Kính mời / Thân mời / Thương mời**.
2. Chọn **Bạn / Anh / Chị / Em / Cô / Chú / Gia đình / Thầy**.
3. Nhập tên, ví dụ **Lê Minh Thương**.
4. Chọn phong cách **Ấm áp / Trang trọng / Thân thiết / Tự chỉnh**; sửa các ô lời nhắn nếu muốn.
5. Có thể dùng các chỗ giữ chỗ: `{doi_tuong}` (bạn, anh, chị, em, gia đình…), `{xung_ho}`, `{ten}`.
6. Nhập mã quản trị được hiển thị khi server khởi chạy, nhấn **Tạo & sao chép link cá nhân**.

Ví dụ:

- Lê Minh Thương → `http://localhost:3000/?k=LMT`
- Nguyễn Ngọc Hải → `http://localhost:3000/?k=NNH`
- Trùng chữ viết tắt → `LMT2`, `LMT3`…

**Bản lưu chứa đầy đủ 3 đoạn lời nhắn, PIN, tên và cách xưng hô**, nên người nhận mở link trên thiết bị khác vẫn thấy nội dung riêng. Gửi lại cùng một bộ dữ liệu sẽ trả về mã cũ, không tạo bản trùng.

## Sửa lỗi mã quản trị

- `401`: mã nhập vào không đúng với mã của **server đang chạy**. Kiểm tra `server/private/admin-key.txt` trên máy chủ (hoặc `INVITE_ADMIN_KEY` nếu dùng biến môi trường).
- `403`: miền của website không nằm trong `ALLOWED_ORIGINS` của server.
- `CORS` / `API không kết nối`: kiểm tra API đã chạy chưa và `site-config.js` trỏ đúng địa chỉ.
- Đừng ghi mã quản trị trong `script.js`, `index.html`, `site-config.js` hay commit lên GitHub.
- Mã chỉ được ghi nhớ trong trình duyệt nếu tích chọn **Ghi nhớ mã**.

## Đưa lên mạng công khai (GitHub Pages)

GitHub Pages **chỉ chạy HTML/CSS/JavaScript**, không chạy file `server/server.mjs`. Vì vậy:

1. Deploy thư mục chứa frontend (`index.html`, `style.css`, `script.js`, `site-config.js`, `assets/`) lên GitHub Pages.
2. Deploy `server/server.mjs` lên host Node có lưu file bền vững / gắn persistent disk. **Không dùng hosting xóa file khi restart** nếu chưa có database khác.
3. Điền URL API vào `site-config.js`:

```javascript
window.GRAD_INVITE_API_BASE = 'https://api-cua-ban.example';
```

4. Trên máy chủ, cấu hình `INVITE_ADMIN_KEY` (ít nhất 16 ký tự), `HOST=0.0.0.0`, `PORT` và `ALLOWED_ORIGINS` bằng URL GitHub Pages chính xác, chẳng hạn `https://username.github.io` (**không có đường dẫn repository**).
5. Dùng HTTPS và giữ thư mục `server/private/`, `server/data/` chỉ trên máy chủ. Không đưa dữ liệu cá nhân hoặc key vào repo public.

Cấu hình frontend mặc định dùng API cùng origin, phù hợp khi chạy trực tiếp bằng Node server. Trên GitHub Pages chưa cấu hình API, trang thiệp vẫn hiển thị được nhưng tạo/tra cứu mã ngắn **chưa hoạt động**. Link cũ `?guest=My+Na`, `?m=...` vẫn sử dụng được. Mã `?k=...` của bản V10 cũ được tìm qua dịch vụ cũ nếu máy chủ mới không có mã đó.

**Chú ý riêng tư:** mã viết tắt như `LMT` có thể bị đoán. Không lưu thông tin bí mật, số giấy tờ hoặc địa chỉ riêng trong lời mời.

## Thành phần ZIP

```text
index.html / style.css / script.js / site-config.js
assets/ (logo, ảnh gốc, bản đồ, nhạc nền)
server/server.mjs (API tạo mã, lưu dữ liệu bền vững)
server/.gitignore (ngăn commit mã quản trị và dữ liệu)
start_windows.bat / start_mac_linux.sh
README.md
```

### Ngày giờ sự kiện

27/11/2026 — Trước lễ chụp ảnh: 10:30–14:30; làm lễ: 15:00–16:30; sau lễ: 16:30–17:30. Countdown tính tới 15:00 giờ Việt Nam.

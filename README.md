# Bách Khoa Premium — V10.2 · GitHub Pages (không server)

Đây là website thiệp mời tốt nghiệp Nguyễn Ngọc Hải, chuyển từ V10.1 sang **website tĩnh 100%**.

## Chạy ngay

- Giải nén ZIP và mở `index.html` bằng Chrome/Edge.
- Hoặc đưa tất cả file/thư mục trong ZIP lên thư mục gốc của repository GitHub Pages (đặc biệt phải có `index.html` ở root).
- GitHub: **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
- Trang công cụ tạo thiệp: `https://USERNAME.github.io/TEN-REPO/?builder=1`.

## Tạo link và cá nhân hóa

Trang `?builder=1` cho phép chọn **Kính mời / Thân mời / Thương mời**, xưng hô, tên khách mời và 3 lời nhắn tùy chỉnh. Không có mã quản trị, không cần Node.js, API hoặc database. Bấm **Tạo & sao chép link cá nhân**.

Ví dụ:
- `?guest=My+Na` — tên My Na, mặc định Bạn/Kính mời.
- `?guest=My+Na&x=chi` — xưng hô Chị.
- `?guest=Co+3+Duy&x=gia-dinh&st=thuong-moi` — Thương mời Gia đình Cô 3 Duy.
- Với 3 mẫu lời nhắn sẵn, URL chỉ thêm `pr=formal` hoặc `pr=friendly`.
- Nếu sửa tự do lời nhắn, URL có thêm `txt=...` chứa cả nội dung dưới dạng mã hóa base64url. Link sẽ dài hơn, nhưng có thể mở ở thiết bị khác vì **không cần server**. Đây là mã hóa biểu diễn, không bảo mật riêng tư.

## PIN điểm hẹn

Trong trang tạo link, chọn **Chấm PIN trực tiếp trên bản đồ**, nhấn lên vị trí, nhập tên và bấm lưu. Tọa độ được gắn kèm URL nếu khác PIN mặc định.

## Nhạc

`assets/music.mp3` là file nhạc Hải cung cấp; trang sẽ thử autoplay, nếu bị trình duyệt chặn thì nhạc bắt đầu sau tương tác đầu tiên. Có nút bật/tắt và âm lượng.

## Cấu trúc

```text
index.html
style.css
script.js
assets/
  hcmut-logo.png
  hai-avatar.png
  hcmut-campus-map.png
  music.mp3
  ...
```

**Không có** mã ngắn `?k=LMT`, mã quản trị, Node.js server hay cơ sở dữ liệu. Các link cũ `?m=...` vẫn có thể được đọc để tránh mất thiệp trước đây, nhưng chức năng tạo link mới chỉ sử dụng `?guest=...`.

## Thời gian lễ

Ngày 27/11/2026: chụp ảnh trước lễ 10:30–14:30; lễ 15:00–16:30; chụp ảnh sau lễ 16:30–17:30. Đồng hồ đếm ngược đến 15:00 giờ Việt Nam.

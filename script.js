/*
 * GRADUATION BOARDING PASS — NGUYỄN NGỌC HẢI
 * Chạy trực tiếp bằng cách mở index.html, không cần cài đặt.
 * Chỉnh thông tin lễ tốt nghiệp ở phần CONFIG bên dưới.
 */

const CONFIG = {
  graduate: 'Nguyễn Ngọc Hải',
  eventDate: '2026-11-27T15:00:00+07:00', // 15:00, giờ Việt Nam
  eventTitle: 'Lễ tốt nghiệp — Nguyễn Ngọc Hải',
  venue: 'Hội trường A5, Trường Đại học Bách khoa, 268 Lý Thường Kiệt, TP. Hồ Chí Minh',
  // Giờ làm lễ 15:00–16:30, dùng đúng thời lượng 90 phút trong lịch .ics.
  eventDurationMinutes: 90,
};

const qs = new URLSearchParams(window.location.search);
const requestedGuest = (qs.get('guest') || '').trim().slice(0, 70);
const guestName = requestedGuest || 'Quý khách';
document.getElementById('guest-name').textContent = guestName.toLocaleUpperCase('vi-VN');

// Tên riêng của khách mời có thể tạo qua ?guest=...
if (requestedGuest) {
  document.title = `Thiệp mời ${requestedGuest} · Tốt nghiệp Nguyễn Ngọc Hải`;
}

const countdownElement = document.getElementById('countdown');
const departureAt = new Date(CONFIG.eventDate).getTime();

function renderCountdown() {
  const remaining = Math.max(0, departureAt - Date.now());
  if (remaining <= 0) {
    document.querySelector('.countdown-title').textContent = 'KHOẢNH KHẮC TỐT NGHIỆP ĐÃ ĐẾN';
    countdownElement.innerHTML = '<span>🎓</span><small>Chúc mừng tốt nghiệp!</small>';
    return true;
  }

  const seconds = Math.floor(remaining / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const values = [days, hours, minutes, secs];
  const labels = ['ngày', 'giờ', 'phút', 'giây'];

  countdownElement.replaceChildren();
  values.forEach((value, index) => {
    const number = document.createElement('span');
    number.textContent = String(value).padStart(2, '0');
    const label = document.createElement('small');
    label.textContent = labels[index];
    countdownElement.append(number, label);
  });
  return false;
}

if (!renderCountdown()) {
  const interval = window.setInterval(() => {
    if (renderCountdown()) window.clearInterval(interval);
  }, 1000);
}

// Chuyển tab thông tin bản đồ và điểm hẹn.
const mapTab = document.getElementById('tab-map');
const meetingTab = document.getElementById('tab-meeting');
const mapPanel = document.getElementById('map-panel');
const meetingPanel = document.getElementById('meeting-panel');

function showTab(tab) {
  const isMap = tab === 'map';
  mapTab.classList.toggle('active', isMap);
  meetingTab.classList.toggle('active', !isMap);
  mapTab.setAttribute('aria-selected', String(isMap));
  meetingTab.setAttribute('aria-selected', String(!isMap));
  mapPanel.hidden = !isMap;
  meetingPanel.hidden = isMap;
}

mapTab.addEventListener('click', () => showTab('map'));
meetingTab.addEventListener('click', () => showTab('meeting'));

// Hai duong di duoc ve tren anh ban do goc do nguoi dung cung cap.
// SVG viewBox duoc giu co dinh 2048x974 de mui ten luon trung khop khi responsive.
const mapCanvas = document.getElementById('campus-map');
const routeButtons = Array.from(document.querySelectorAll('[data-route-choice]'));
const routeDescription = document.getElementById('route-description');
const routeDescriptions = {
  both: '🔵 Cổng 1 (Lý Thường Kiệt) hoặc 🟠 Cổng 3 (Tô Hiến Thành) → tòa A5. Mũi tên đang chuyển động theo hướng đi.',
  gate1: '🔵 Tuyến Cổng 1: vào từ đường Lý Thường Kiệt, đi qua khu vực gần sân banh rồi hướng tới tòa A5.',
  gate3: '🟠 Tuyến Cổng 3: vào từ đường Tô Hiến Thành, đi theo lối giữa các dãy nhà và hướng tới tòa A5.',
};

routeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.routeChoice;
    mapCanvas.dataset.selected = selected;
    routeDescription.textContent = routeDescriptions[selected];
    routeButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});

// JavaScript animation moves actual arrowheads on the SVG routes. CSS alone
// animates the dashed line, while this moves and rotates the arrows correctly.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const routeArrows = [
    { path: document.getElementById('path-gate1'), arrow: document.querySelector('.route-gate1 .moving-arrow'), duration: 5400 },
    { path: document.getElementById('path-gate3'), arrow: document.querySelector('.route-gate3 .moving-arrow'), duration: 8000 },
  ].map((item) => ({ ...item, length: item.path.getTotalLength() }));

  const animateRouteArrows = (timestamp) => {
    routeArrows.forEach(({ path, arrow, duration, length }) => {
      const distance = ((timestamp % duration) / duration) * length;
      const position = path.getPointAtLength(distance);
      const ahead = path.getPointAtLength(Math.min(length, distance + 2));
      const behind = path.getPointAtLength(Math.max(0, distance - 2));
      const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180 / Math.PI;
      arrow.setAttribute('transform', `translate(${position.x} ${position.y}) rotate(${angle})`);
    });
    window.requestAnimationFrame(animateRouteArrows);
  };
  window.requestAnimationFrame(animateRouteArrows);
}

// Phong to ban do ma khong lam mat chuyen dong cua cac mui ten.
const zoomButton = document.getElementById('map-zoom-button');
const closeButton = document.getElementById('map-close-button');
const mapBackdrop = document.getElementById('map-backdrop');
const boardingPass = document.querySelector('.boarding-pass');
const mapOriginalParent = mapCanvas.parentElement;
const mapOriginalNextSibling = mapCanvas.nextSibling;

function setMapExpanded(expanded) {
  // Body-level overlay escapes the ticket's stacking context, so the map
  // stays ABOVE the backdrop instead of being dimmed by it.
  if (expanded) document.body.append(mapCanvas);
  else mapOriginalParent.insertBefore(mapCanvas, mapOriginalNextSibling);
  mapCanvas.classList.toggle('expanded', expanded);
  boardingPass.classList.toggle('map-dialog-open', expanded);
  document.body.classList.toggle('map-expanded', expanded);
  mapBackdrop.hidden = !expanded;
  closeButton.hidden = !expanded;
  zoomButton.setAttribute('aria-expanded', String(expanded));
  if (expanded) closeButton.focus();
  else zoomButton.focus();
}

zoomButton.addEventListener('click', () => setMapExpanded(true));
closeButton.addEventListener('click', () => setMapExpanded(false));
mapBackdrop.addEventListener('click', () => setMapExpanded(false));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && mapCanvas.classList.contains('expanded')) setMapExpanded(false);
});
meetingTab.addEventListener('click', () => {
  if (mapCanvas.classList.contains('expanded')) setMapExpanded(false);
});

// PIN điểm hẹn được lưu trong URL để ai nhận link đều thấy cùng vị trí.
// Ví dụ: ?guest=My%20Na&pin=45.3,46.2&spot=Goc%20san%20banh
const pinLayer = document.getElementById('pin-layer');
const pinMarker = document.getElementById('meeting-pin');
const pinLabel = document.getElementById('pin-label');
const photoMeetingText = document.getElementById('photo-meeting-text');
const defaultPhotoMeetingHTML = photoMeetingText.innerHTML;
const pinNameInput = document.getElementById('pin-name-input');
const pinEditor = document.getElementById('pin-editor');
const pinPickButton = document.getElementById('pin-pick-button');
const pinShareOutput = document.getElementById('pin-share-output');

function readPinFromURL() {
  const coordinates = (qs.get('pin') || '').split(',').map(Number);
  if (coordinates.length !== 2 || coordinates.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) return null;
  return {
    x: coordinates[0],
    y: coordinates[1],
    label: (qs.get('spot') || 'Điểm hẹn chụp ảnh').trim().slice(0, 70) || 'Điểm hẹn chụp ảnh',
  };
}

let meetingPin = readPinFromURL();
function renderMeetingPin() {
  pinMarker.hidden = !meetingPin;
  if (meetingPin) {
    pinMarker.style.left = `${meetingPin.x}%`;
    pinMarker.style.top = `${meetingPin.y}%`;
    pinLabel.textContent = meetingPin.label;
    pinMarker.setAttribute('aria-label', `Điểm hẹn chụp ảnh: ${meetingPin.label}`);
    photoMeetingText.textContent = `📍 Điểm hẹn: ${meetingPin.label}. Xem PIN vàng trên bản đồ để tìm đúng vị trí.`;
  } else {
    photoMeetingText.innerHTML = defaultPhotoMeetingHTML;
  }
}
renderMeetingPin();

function syncPinURL() {
  const url = new URL(window.location.href);
  if (meetingPin) {
    url.searchParams.set('pin', `${meetingPin.x.toFixed(1)},${meetingPin.y.toFixed(1)}`);
    url.searchParams.set('spot', meetingPin.label);
  } else {
    url.searchParams.delete('pin');
    url.searchParams.delete('spot');
  }
  window.history.replaceState(null, '', url);
}

function createShareableURL(name) {
  const url = new URL(window.location.href);
  url.searchParams.delete('builder');
  if (name) url.searchParams.set('guest', name);
  else url.searchParams.delete('guest');
  if (meetingPin) {
    url.searchParams.set('pin', `${meetingPin.x.toFixed(1)},${meetingPin.y.toFixed(1)}`);
    url.searchParams.set('spot', meetingPin.label);
  } else {
    url.searchParams.delete('pin');
    url.searchParams.delete('spot');
  }
  return url;
}

if (qs.get('builder') === '1') {
  pinEditor.hidden = false;
  pinNameInput.value = meetingPin?.label || '';
  pinPickButton.setAttribute('aria-pressed', 'false');

  pinPickButton.addEventListener('click', () => {
    showTab('map');
    pinLayer.classList.add('editing');
    pinPickButton.setAttribute('aria-pressed', 'true');
    setMapExpanded(true);
    showToast('Chạm vào vị trí muốn hẹn trên bản đồ phóng to.');
  });

  pinLayer.addEventListener('click', (event) => {
    if (!pinLayer.classList.contains('editing')) return;
    const rect = pinLayer.getBoundingClientRect();
    const clamp = (n) => Math.max(0, Math.min(100, n));
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100);
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100);
    meetingPin = {
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      label: pinNameInput.value.trim().slice(0, 70) || 'Điểm hẹn chụp ảnh',
    };
    renderMeetingPin();
    pinLayer.classList.remove('editing');
    pinPickButton.setAttribute('aria-pressed', 'false');
    setMapExpanded(false);
    pinNameInput.focus();
    showToast('Đã chấm PIN. Nhập tên điểm hẹn rồi lưu link nhé!');
  });

  document.getElementById('pin-save-button').addEventListener('click', async () => {
    if (!meetingPin) return showToast('Hãy chấm một vị trí PIN trên bản đồ trước.');
    meetingPin.label = pinNameInput.value.trim().slice(0, 70) || 'Điểm hẹn chụp ảnh';
    renderMeetingPin();
    syncPinURL();
    const url = createShareableURL(requestedGuest).href;
    const copied = await copyText(url);
    pinShareOutput.textContent = url;
    showToast(copied ? 'Đã lưu PIN và sao chép link!' : 'Đã lưu PIN. Sao chép link ngay bên dưới.');
  });

  document.getElementById('pin-clear-button').addEventListener('click', () => {
    meetingPin = null;
    renderMeetingPin();
    pinLayer.classList.remove('editing');
    pinPickButton.setAttribute('aria-pressed', 'false');
    pinNameInput.value = '';
    syncPinURL();
    pinShareOutput.textContent = 'Đã xóa PIN khỏi đường dẫn hiện tại.';
    showToast('Đã xóa điểm hẹn.');
  });
}

// Bản nhạc do Hải tải lên: chỉ phát sau thao tác của người xem.
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicText = document.getElementById('music-text');
const musicSymbol = document.getElementById('music-symbol');
const musicVolume = document.getElementById('music-volume');
music.volume = Number(musicVolume.value) / 100;
function refreshMusicButton() {
  const isPlaying = !music.paused;
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute('aria-label', isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  musicText.textContent = isPlaying ? 'Tắt nhạc' : 'Bật nhạc';
  musicSymbol.textContent = isPlaying ? '♫' : '♪';
}
musicToggle.addEventListener('click', async () => {
  if (!music.paused) {
    music.pause();
    return;
  }
  try { await music.play(); }
  catch { showToast('Không mở được nhạc lúc này. Hãy thử lại.'); }
  refreshMusicButton();
});
music.addEventListener('play', refreshMusicButton);
music.addEventListener('pause', refreshMusicButton);
musicVolume.addEventListener('input', () => { music.volume = Number(musicVolume.value) / 100; });
refreshMusicButton();

// Tải sự kiện iCalendar để dùng trong điện thoại / Google Calendar / Outlook.
function downloadCalendarEvent() {
  const pad = (n) => String(n).padStart(2, '0');
  const utcStamp = (date) =>
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
  const start = new Date(CONFIG.eventDate);
  const end = new Date(start.getTime() + CONFIG.eventDurationMinutes * 60000);
  const escapeICS = (value) => value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hai Nguyen//Graduation Boarding Pass//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:hcmut-grad-2026-nguyen-ngoc-hai@boarding-pass`,
    `DTSTAMP:${utcStamp(new Date())}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    `SUMMARY:${escapeICS(CONFIG.eventTitle)}`,
    `LOCATION:${escapeICS(CONFIG.venue)}`,
    `DESCRIPTION:${escapeICS('Thiệp mời dành cho ' + guestName + '. Hẹn gặp bạn tại lễ tốt nghiệp của Hải!')}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const blob = new Blob([lines.join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'Le_Tot_Nghiep_Nguyen_Ngoc_Hai_2026.ics';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  showToast('Đã tải lịch! Mở file .ics để thêm sự kiện.');
}

document.getElementById('calendar-button').addEventListener('click', downloadCalendarEvent);

const toast = document.getElementById('toast');
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3200);
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(value); return true; } catch { /* fallback */ }
  }
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  let success = false;
  try { success = document.execCommand('copy'); } catch { /* ignore */ }
  textarea.remove();
  return success;
}

document.getElementById('share-button').addEventListener('click', async () => {
  const shareData = {
    title: 'Thiệp mời tốt nghiệp của Hải',
    text: `Thân mời ${guestName} đến dự lễ tốt nghiệp của Hải ngày 27.11.2026!`,
    url: createShareableURL(requestedGuest).href,
  };
  if (navigator.share) {
    try { await navigator.share(shareData); return; } catch (error) {
      if (error.name === 'AbortError') return;
    }
  }
  const copied = await copyText(shareData.url);
  showToast(copied ? 'Đã sao chép đường dẫn thiệp mời!' : 'Không sao chép tự động được. Hãy sao chép URL trên thanh địa chỉ.');
});

// Công cụ tạo link cho chủ thiệp: mở website kèm ?builder=1
// Đây chỉ là công cụ phía trình duyệt, KHÔNG phải quyền quản trị hay đăng nhập.
if (qs.get('builder') === '1') {
  const builder = document.getElementById('link-builder');
  builder.hidden = false;
  const form = document.getElementById('guest-form');
  const input = document.getElementById('guest-input');
  const output = document.getElementById('builder-output');
  input.value = requestedGuest;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = input.value.trim();
    if (!name) return;
    const url = createShareableURL(name);
    const copied = await copyText(url.href);
    output.textContent = url.href;
    showToast(copied ? 'Đã tạo và sao chép link khách mời!' : 'Đã tạo link. Sao chép đường dẫn ở phía dưới.');
  });
}

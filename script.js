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
const INVITE_API_BASE = 'https://hai-graduation-shortlinks-2026.breezyteal1027.chatgpt.site';
const serverCode = /^[A-Z0-9]{1,14}$/.test(qs.get('k') || '') ? qs.get('k') : '';
const SALUTATIONS = { ban: 'Bạn', anh: 'Anh', chi: 'Chị', em: 'Em', co: 'Cô', chu: 'Chú', 'gia-dinh': 'Gia đình', thay: 'Thầy' };
const SHORT_SALUTATIONS = { b: 'ban', a: 'anh', c: 'chi', e: 'em', o: 'co', u: 'chu', g: 'gia-dinh', t: 'thay' };
function decodeCompactName(data) {
  if (!data) return '';
  try {
    const bytes = Uint8Array.from(atob(data.replace(/-/g, '+').replace(/_/g, '/')), (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch { return ''; }
}
function encodeCompactName(name) {
  const bytes = new TextEncoder().encode(name);
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}
// Link một tham số: ?m=MTU.e.TWluaCBUaMawxqFuZw
// Giữ mã viết tắt, xưng hô và tên đầy đủ ngay trong URL, không cần máy chủ.
function readShortInvite() {
  const match = /^([A-Z0-9]{1,14})\.([baceougt])\.([A-Za-z0-9_-]+)$/.exec(qs.get('m') || '');
  if (!match) return null;
  const name = decodeCompactName(match[3]).trim().slice(0, 70);
  return name ? { code: match[1], salutation: SHORT_SALUTATIONS[match[2]], name } : null;
}
const shortInvite = readShortInvite();
let requestedGuest = (shortInvite?.name || decodeCompactName(qs.get('g')) || qs.get('guest') || '').trim().slice(0, 70);
let salutationCode = shortInvite?.salutation || (Object.hasOwn(SALUTATIONS, qs.get('x')) ? qs.get('x') : 'ban');
let guestName = requestedGuest || 'Quý khách';
let guestAddress = requestedGuest ? `${SALUTATIONS[salutationCode]} ${guestName}` : guestName;
function renderGuest() {
  guestName = requestedGuest || 'Quý khách';
  guestAddress = requestedGuest ? `${SALUTATIONS[salutationCode]} ${guestName}` : guestName;
  document.getElementById('guest-name').textContent = serverCode && !requestedGuest
    ? 'ĐANG TẢI THIỆP MỜI…' : guestAddress.toLocaleUpperCase('vi-VN');
  if (requestedGuest) document.title = `Thiệp mời ${requestedGuest} · Tốt nghiệp Nguyễn Ngọc Hải`;
}
renderGuest();

// Tên riêng của khách mời có thể tạo qua ?guest=...
// ?k=LMT sẽ truy vấn tên/xưng hô/PIN đã lưu trên máy chủ.

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
const pathGate1 = document.getElementById('path-gate1');
const pathGate3 = document.getElementById('path-gate3');
function updateRoutesToPin(pin) {
  mapCanvas.classList.toggle('no-pin', !pin);
  if (!pin) return;
  const x = Math.round(pin.x * 20.48);
  const y = Math.round(pin.y * 9.74);
  // Hai tuyến nối đến PIN người dùng chọn, không kết thúc ở ký hiệu A5.
  pathGate1.setAttribute('d', `M386 420 C425 435 466 453 507 451 L594 448 Q635 443 684 441 Q765 442 ${x} ${y}`);
  pathGate3.setAttribute('d', `M1820 575 L1761 557 Q1734 529 1725 482 Q1718 457 1643 459 L1479 457 L1352 458 L1212 460 Q1127 463 1057 452 Q917 467 ${x} ${y}`);
}

routeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const selected = button.dataset.routeChoice;
    mapCanvas.dataset.selected = selected;
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
  ];

  const animateRouteArrows = (timestamp) => {
    routeArrows.forEach(({ path, arrow, duration }) => {
      const length = path.getTotalLength();
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
const defaultPhotoMeetingHTML = photoMeetingText?.innerHTML || '';
const pinNameInput = document.getElementById('pin-name-input');
const pinEditor = document.getElementById('pin-editor');
const pinPickButton = document.getElementById('pin-pick-button');
const pinShareOutput = document.getElementById('pin-share-output');

const DEFAULT_PIN = { x: 39.4, y: 58.8, label: 'Điểm hẹn' };
function normalizeMeetingLabel(label) {
  const name = String(label || '').trim().slice(0, 70);
  return !name || name.toLocaleLowerCase('vi-VN') === 'điểm hẹn chụp ảnh' ? 'Điểm hẹn' : name;
}
function readPinFromURL() {
  const short = qs.get('p');
  if (short === 'off') return null;
  if (short) {
    const match = /^([0-9a-z]+)\.([0-9a-z]+)$/.exec(short);
    if (!match) return null;
    const x = Number.parseInt(match[1], 36) / 10;
    const y = Number.parseInt(match[2], 36) / 10;
    if (![x, y].every((value) => Number.isFinite(value) && value >= 0 && value <= 100)) return null;
    return { x, y, label: normalizeMeetingLabel(decodeCompactName(qs.get('s'))) };
  }
  const raw = qs.get('pin');
  if (raw === 'off') return null;
  // Điểm hẹn Hải đánh dấu trên ảnh tham khảo, có thể thay bằng chế độ ?builder=1.
  if (!raw) return { ...DEFAULT_PIN };
  const coordinates = raw.split(',').map(Number);
  if (coordinates.length !== 2 || coordinates.some((value) => !Number.isFinite(value) || value < 0 || value > 100)) return null;
  return {
    x: coordinates[0],
    y: coordinates[1],
    label: normalizeMeetingLabel(qs.get('spot')),
  };
}

let meetingPin = readPinFromURL();
function renderMeetingPin() {
  pinMarker.hidden = !meetingPin;
  updateRoutesToPin(meetingPin);
  if (meetingPin) {
    pinMarker.style.left = `${meetingPin.x}%`;
    pinMarker.style.top = `${meetingPin.y}%`;
    pinLabel.textContent = meetingPin.label;
    pinMarker.setAttribute('aria-label', meetingPin.label === DEFAULT_PIN.label ? 'Điểm hẹn' : `Điểm hẹn: ${meetingPin.label}`);
    if (photoMeetingText) photoMeetingText.textContent = meetingPin.label === DEFAULT_PIN.label
      ? '📍 Xem PIN vàng trên bản đồ để đến điểm hẹn của Hải.'
      : `📍 Điểm hẹn: ${meetingPin.label}. Xem PIN vàng trên bản đồ để tìm đúng vị trí.`;
  } else if (photoMeetingText) {
    photoMeetingText.innerHTML = defaultPhotoMeetingHTML;
  }
}
renderMeetingPin();

async function resolveServerInvite() {
  if (!serverCode) return;
  try {
    const response = await fetch(`${INVITE_API_BASE}/api/invites/${serverCode}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Không tìm thấy mã khách mời.');
    const invite = await response.json();
    if (typeof invite.name !== 'string' || !Object.hasOwn(SALUTATIONS, invite.salutation)) throw new Error('Dữ liệu thiệp không hợp lệ.');
    requestedGuest = invite.name.trim().slice(0, 70);
    salutationCode = invite.salutation;
    renderGuest();
    if (!qs.has('p') && !qs.has('pin')) {
      const pin = invite.pin;
      meetingPin = pin && Number.isFinite(pin.x) && Number.isFinite(pin.y) && pin.x >= 0 && pin.x <= 100 && pin.y >= 0 && pin.y <= 100
        ? { x: pin.x, y: pin.y, label: normalizeMeetingLabel(pin.label) } : null;
      renderMeetingPin();
    }
  } catch {
    document.getElementById('guest-name').textContent = 'KHÔNG TẢI ĐƯỢC THIỆP MỜI';
    showToast('Không tra cứu được mã khách mời. Vui lòng nhờ Hải kiểm tra link.');
  }
}
void resolveServerInvite();

function addCompactPin(url) {
  if (!meetingPin) {
    url.searchParams.set('p', 'off');
    return;
  }
  const isDefaultPosition = Math.abs(meetingPin.x - DEFAULT_PIN.x) < 0.05 && Math.abs(meetingPin.y - DEFAULT_PIN.y) < 0.05;
  if (isDefaultPosition && meetingPin.label === DEFAULT_PIN.label) return;
  // Tọa độ lưu ở đơn vị 1/10%, mã hóa base36 để ngắn hơn "39.4,58.8".
  url.searchParams.set('p', `${Math.round(meetingPin.x * 10).toString(36)}.${Math.round(meetingPin.y * 10).toString(36)}`);
  if (meetingPin.label !== DEFAULT_PIN.label) url.searchParams.set('s', encodeCompactName(meetingPin.label));
}

function syncPinURL() {
  const url = new URL(window.location.href);
  for (const key of ['pin', 'spot', 'p', 's']) url.searchParams.delete(key);
  addCompactPin(url);
  window.history.replaceState(null, '', url);
}

function nameInitials(fullName) {
  const spaced = fullName.replace(/([a-zà-ỹ])([A-ZÀ-Ỹ])/g, '$1 $2');
  return spaced.trim().split(/[\s._-]+/).filter(Boolean).map((part) => part[0])
    .join('').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'D')
    .replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 8) || 'KM';
}

function createServerCodeURL(code) {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('k', code);
  return url;
}

function createShareableURL(name, salutation = salutationCode, code = null) {
  const url = new URL(window.location.href);
  url.search = '';
  if (serverCode && name === requestedGuest && salutation === salutationCode && (code === null || code === serverCode)) {
    url.searchParams.set('k', serverCode);
    return url;
  }
  if (name) {
    const inviteCode = code || shortInvite?.code || qs.get('i') || nameInitials(name);
    const shortSalutation = Object.keys(SHORT_SALUTATIONS).find((key) => SHORT_SALUTATIONS[key] === salutation) || 'b';
    url.searchParams.set('m', `${inviteCode}.${shortSalutation}.${encodeCompactName(name)}`);
  }
  addCompactPin(url);
  return url;
}

// Các link cũ vẫn đọc được, nhưng thanh địa chỉ tự chuyển sang định dạng ngắn.
if (['guest', 'i', 'g', 'x', 'pin', 'spot'].some((key) => qs.has(key))) {
  const compactURL = createShareableURL(requestedGuest, salutationCode, qs.get('i'));
  if (qs.get('builder') === '1') compactURL.searchParams.set('builder', '1');
  try { window.history.replaceState(null, '', compactURL); } catch { /* mở file trên máy */ }
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
      label: normalizeMeetingLabel(pinNameInput.value),
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
    meetingPin.label = normalizeMeetingLabel(pinNameInput.value);
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

// Mở đầu theo phong cách bảng khởi hành: lật từng ô chữ, chạm/xé vé để vào thiệp.
const departureIntro = document.getElementById('departure-intro');
if (departureIntro) {
  departureIntro.querySelectorAll('[data-flip-value]').forEach((row, rowIndex) => {
    const letters = [...row.dataset.flipValue];
    row.replaceChildren();
    letters.forEach((letter, letterIndex) => {
      const tile = document.createElement('span');
      tile.className = `flap-tile${letter === ' ' ? ' is-blank' : ''}`;
      tile.textContent = letter === ' ' ? '\u00a0' : letter;
      tile.setAttribute('aria-hidden', 'true');
      tile.style.animationDelay = `${rowIndex * 125 + letterIndex * 45}ms`;
      row.append(tile);
    });
  });

  if (qs.get('builder') === '1') {
    departureIntro.hidden = true;
    document.body.classList.remove('intro-active');
  } else {
    let isTearing = false;
    function tearTicket() {
      if (isTearing) return;
      isTearing = true;
      departureIntro.classList.add('is-opening');
      const wait = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 540;
      window.setTimeout(() => {
        document.body.classList.remove('intro-active');
        departureIntro.hidden = true;
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, wait);
    }
    document.getElementById('tear-ticket').addEventListener('click', tearTicket);
    let downY = null;
    departureIntro.addEventListener('pointerdown', (event) => { downY = event.clientY; });
    departureIntro.addEventListener('pointerup', (event) => {
      if (downY !== null && event.clientY - downY > 55) tearTicket();
      downY = null;
    });
    window.addEventListener('wheel', (event) => {
      if (document.body.classList.contains('intro-active') && event.deltaY > 25) tearTicket();
    }, { passive: true });
    window.addEventListener('keydown', (event) => {
      if (document.body.classList.contains('intro-active') && ['ArrowDown', 'PageDown'].includes(event.key)) tearTicket();
    });
  }
}

// Mặc định muốn phát nhạc: thử autoplay và bắt đầu ở tương tác đầu tiên nếu bị chặn.
const music = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
const musicText = document.getElementById('music-text');
const musicSymbol = document.getElementById('music-symbol');
const musicVolume = document.getElementById('music-volume');
music.volume = Number(musicVolume.value) / 100;
let musicWanted = true;
function refreshMusicButton() {
  const isPlaying = !music.paused;
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute('aria-label', isPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền');
  musicText.textContent = isPlaying ? 'Tắt nhạc' : 'Bật nhạc';
  musicSymbol.textContent = isPlaying ? '♫' : '♪';
}
musicToggle.addEventListener('click', async () => {
  if (!music.paused) {
    musicWanted = false;
    music.pause();
    return;
  }
  musicWanted = true;
  try { await music.play(); }
  catch { showToast('Không mở được nhạc lúc này. Hãy thử lại.'); }
  refreshMusicButton();
});
music.addEventListener('play', refreshMusicButton);
music.addEventListener('pause', refreshMusicButton);
musicVolume.addEventListener('input', () => { music.volume = Number(musicVolume.value) / 100; });
refreshMusicButton();
async function startDefaultMusic() {
  if (!musicWanted || !music.paused) return;
  try { await music.play(); } catch { /* Trình duyệt yêu cầu tương tác trước khi phát. */ }
  refreshMusicButton();
}
function startMusicOnInteraction(event) {
  // Nút nhạc có xử lý riêng, tránh vừa bật vừa tắt trong cùng lần click.
  if (event.target instanceof Element && event.target.closest('.music-widget')) return;
  startDefaultMusic();
}
document.addEventListener('pointerdown', startMusicOnInteraction, { capture: true });
document.addEventListener('keydown', startMusicOnInteraction, { capture: true });
startDefaultMusic();

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
    text: `Thân mời ${guestAddress} đến dự lễ tốt nghiệp của Hải ngày 27.11.2026!`,
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
  const salutationSelect = document.getElementById('guest-salutation');
  const adminInput = document.getElementById('invite-admin-key');
  const codePreview = document.getElementById('guest-short-code');
  const output = document.getElementById('builder-output');
  input.value = requestedGuest;
  salutationSelect.value = salutationCode;
  try { adminInput.value = localStorage.getItem('hai-invite-admin-key-v1') || ''; } catch { /* trình duyệt riêng tư */ }

  input.addEventListener('input', () => { codePreview.textContent = input.value.trim() ? nameInitials(input.value) : '—'; });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = input.value.trim();
    const adminKey = adminInput.value.trim();
    if (!name || !adminKey) return;
    const salutation = salutationSelect.value;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'ĐANG LƯU MÃ…';
    try {
      const response = await fetch(`${INVITE_API_BASE}/api/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Invite-Admin-Key': adminKey },
        body: JSON.stringify({ name, salutation, pin: meetingPin }),
      });
      const data = await response.json();
      if (!response.ok || !data.code) throw new Error(data.error || 'Không lưu được mã khách mời.');
      try { localStorage.setItem('hai-invite-admin-key-v1', adminKey); } catch { /* trình duyệt riêng tư */ }
      const url = createServerCodeURL(data.code);
      const copied = await copyText(url.href);
      codePreview.textContent = data.code;
      output.textContent = url.href;
      showToast(copied ? 'Đã tạo mã riêng và sao chép link!' : 'Đã lưu mã. Sao chép link bên dưới nhé!');
    } catch (error) {
      output.textContent = error.message || 'Không kết nối được máy chủ lưu mã.';
      showToast('Không lưu được mã. Kiểm tra mã quản trị và thử lại.');
    } finally {
      button.disabled = false;
      button.textContent = 'Tạo & sao chép link cá nhân';
    }
  });
}

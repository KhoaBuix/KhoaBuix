// ============ CẤU HÌNH GOOGLE SHEETS (DÙNG LÀM "DATABASE" CHO THỰC ĐƠN) ============
// Dán link CSV lấy được sau khi "Publish to web" Google Sheet của bạn vào biến này
// (xem hướng dẫn từng bước ở phần chat). Ví dụ link đúng sẽ có dạng:
// https://docs.google.com/spreadsheets/d/e/2PACX-xxxxxxxx/pub?output=csv
const MENU_SHEET_CSV_URL = 'DÁN_LINK_CSV_GOOGLE_SHEETS_VÀO_ĐÂY';

// ============ DỮ LIỆU DỰ PHÒNG (FALLBACK) ============
// Đây là "lưới an toàn": nếu bạn chưa dán link ở trên, hoặc Google Sheets tạm thời không
// tải được (mất mạng, đổi link, sheet bị xóa quyền xem...), trang web sẽ tự động dùng
// dữ liệu này thay vì bị vỡ / hiện trang trắng.
// Cấu trúc: key là tên danh mục (phải viết giống hệt giá trị trong cột "category" trên Sheets),
// value là mảng các món ăn { icon, name, price, desc }.
const FALLBACK_MENU_DATA = {
  'Entrées': [
    { icon: '🥗', name: 'Rouleaux de printemps aux crevettes et porc', price: '45.000đ', desc: 'Rouleaux frais aux crevettes, porc, vermicelles et herbes aromatiques, servis avec une sauce nuoc-mâm aigre-douce.' },
    { icon: '🍤', name: 'Nems aux fruits de mer', price: '55.000đ', desc: 'Nems croustillants farcis de crevettes et de calamars, servis avec des herbes fraîches et une sauce spéciale.' },
    { icon: '🥘', name: "Soupe de crabe à l'œuf de cent ans", price: '40.000đ', desc: "Soupe de crabe onctueuse et parfumée, relevée par l'œuf de cent ans." },
  ],
  'Plats principaux': [
    { icon: '🍜', name: 'Pho au bœuf (tendre et poitrine)', price: '65.000đ', desc: 'Bouillon mijoté 12 heures, nouilles de riz moelleuses, fines tranches de bœuf frais.' },
    { icon: '🍲', name: 'Bún bò Huế (soupe épicée de Huế)', price: '60.000đ', desc: 'Saveur épicée typique de Huế, avec jarret de porc et pâté de crabe.' },
    { icon: '🍛', name: 'Riz brisé au porc grillé, couenne et pâté', price: '58.000đ', desc: "Côtelette de porc grillée parfumée, couenne croustillante et pâté d'œuf fondant." },
    { icon: '🐟', name: 'Poisson braisé en pot de terre', price: '85.000đ', desc: 'Poisson mijoté en pot de terre selon une recette familiale, au goût intense et inoubliable.' },
    { icon: '🍚', name: 'Riz frit aux fruits de mer', price: '70.000đ', desc: 'Riz doré sauté avec crevettes, calamars et légumes frais.' },
    { icon: '🍢', name: 'Fondue thaïe aux fruits de mer', price: '250.000đ', desc: 'Fondue acidulée et épicée pour 3 à 4 personnes, généreusement garnie de fruits de mer frais.' },
  ],
  'Desserts': [
    { icon: '🍮', name: 'Dessert khúc bạch (gelée de lait aux amandes)', price: '35.000đ', desc: 'Frais et léger, à base de gelée de lait, amandes et longanes.' },
    { icon: '🍨', name: 'Glace au riz gluant et à la noix de coco', price: '38.000đ', desc: 'Glace onctueuse à la noix de coco sur un lit de riz gluant parfumé.' },
    { icon: '🍡', name: 'Flan au caramel', price: '30.000đ', desc: "Onctueux et parfumé, un flan aux œufs et au caramel légèrement amer." },
  ],
  'Boissons': [
    { icon: '🍵', name: 'Thé au lotus doré', price: '32.000đ', desc: 'Thé infusé au lotus naturel, doux et apaisant.' },
    { icon: '🥥', name: 'Eau de coco fraîche', price: '35.000đ', desc: 'Noix de coco fraîche entière, rafraîchissante et désaltérante.' },
    { icon: '☕', name: 'Café glacé au lait concentré', price: '29.000đ', desc: 'Un café corsé, préparé selon la méthode traditionnelle vietnamienne au filtre.' },
  ],
};

// Thứ tự tab mong muốn hiển thị; danh mục nào có trên Sheets nhưng không nằm trong danh sách
// này (ví dụ bạn tự thêm 1 danh mục mới) sẽ được tự động xếp thêm vào cuối.
const CATEGORY_ORDER = ['Entrées', 'Plats principaux', 'Desserts', 'Boissons'];

// Biến lưu dữ liệu thực đơn ĐANG được dùng để hiển thị (mặc định = dữ liệu dự phòng,
// sẽ được thay bằng dữ liệu thật từ Google Sheets nếu tải thành công — xem initMenu() bên dưới).
let currentMenuData = FALLBACK_MENU_DATA;

// escapeHtml: chuyển ký tự đặc biệt (<, >, &...) thành dạng an toàn trước khi chèn vào HTML.
// Bắt buộc phải làm vậy vì dữ liệu lấy từ Google Sheets là "nguồn bên ngoài" — nếu ai đó (vô tình
// hay cố ý) gõ mã HTML/script vào ô trên Sheets, escapeHtml sẽ ngăn nó chạy như code thật (chống XSS).
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

// parseCSV: tự viết 1 hàm nhỏ để đọc văn bản CSV thành mảng các dòng/cột.
// Phải tự xử lý dấu ngoặc kép (") vì Google Sheets sẽ bọc ô nào có dấu phẩy hoặc xuống dòng
// bên trong bằng dấu ngoặc kép (ví dụ mô tả món ăn có dấu phẩy) — nếu tách chuỗi đơn giản bằng
// split(',') thì sẽ bị tách sai ở những ô đó.
function parseCSV(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') { field += '"'; i++; } // dấu " lặp đôi nghĩa là 1 dấu " thật trong nội dung
      else if (char === '"') { inQuotes = false; }
      else { field += char; }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field); field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++; // bỏ qua \n thừa khi xuống dòng kiểu Windows (\r\n)
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += char;
    }
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }

  return rows.filter(r => r.some(cell => cell.trim() !== '')); // bỏ các dòng hoàn toàn trống
}

// loadMenuFromSheet: tải file CSV từ Google Sheets rồi chuyển thành object giống FALLBACK_MENU_DATA.
// Trả về null nếu chưa cấu hình link, hoặc có lỗi xảy ra (mất mạng, link sai...) — để nơi gọi
// hàm này biết mà dùng dữ liệu dự phòng thay thế.
async function loadMenuFromSheet() {
  if (!MENU_SHEET_CSV_URL || MENU_SHEET_CSV_URL.includes('DÁN_LINK')) return null;

  try {
    const response = await fetch(MENU_SHEET_CSV_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();

    const rows = parseCSV(csvText);
    rows.shift(); // bỏ dòng đầu tiên (dòng tiêu đề: category,icon,name,price,desc)

    const data = {};
    rows.forEach(([category, icon, name, price, desc]) => {
      const cat = (category || '').trim();
      if (!cat) return; // dòng thiếu category thì bỏ qua
      if (!data[cat]) data[cat] = [];
      data[cat].push({
        icon: (icon || '').trim(),
        name: (name || '').trim(),
        price: (price || '').trim(),
        desc: (desc || '').trim(),
      });
    });

    return Object.keys(data).length ? data : null;
  } catch (err) {
    console.warn('Impossible de charger le menu depuis Google Sheets, utilisation des données par défaut.', err);
    return null;
  }
}

// ============ HIỆU ỨNG HEADER KHI CUỘN TRANG ============
// Lấy 2 phần tử: thanh header và nút "lên đầu trang" để điều khiển bằng JS
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

function onScroll() {
  // window.scrollY: số pixel đã cuộn từ đầu trang xuống
  // Nếu cuộn quá 40px -> thêm class "scrolled" để CSS đổi header sang nền trắng (xem .header.scrolled trong style.css)
  const scrolled = window.scrollY > 40;
  header.classList.toggle('scrolled', scrolled);
  // Nếu cuộn quá 500px -> hiện nút "lên đầu trang"
  backToTop.classList.toggle('show', window.scrollY > 500);
}
// Mỗi lần người dùng cuộn trang, trình duyệt tự gọi hàm onScroll()
window.addEventListener('scroll', onScroll);
onScroll(); // gọi 1 lần ngay khi tải trang, phòng trường hợp trang load sẵn ở vị trí đã cuộn

// Bấm nút "lên đầu trang" -> cuộn mượt (smooth) về đầu trang
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============ MENU DI ĐỘNG (MOBILE) ============
const burger = document.getElementById('burger'); // nút hamburger 3 gạch
const nav = document.getElementById('nav');        // khung menu trượt ra từ bên phải

// Bấm vào nút hamburger -> thêm/xóa class "open" để CSS hiện/ẩn menu (hiệu ứng trượt)
burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});

// Khi bấm vào 1 link bất kỳ trong menu mobile -> tự động đóng menu lại
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

// ============ TAB LỌC + HIỂN THỊ THỰC ĐƠN ============
const menuTabs = document.getElementById('menuTabs'); // khung chứa các nút tab (giờ được tạo tự động)
const menuGrid = document.getElementById('menuGrid');  // khung sẽ chứa danh sách món ăn

// renderTabs: tạo các nút tab dựa trên danh mục thực sự có trong dữ liệu (data),
// sắp xếp theo CATEGORY_ORDER, danh mục lạ (không nằm trong CATEGORY_ORDER) xếp cuối.
// Trả về mảng thứ tự danh mục để nơi gọi biết nên hiển thị tab nào đầu tiên.
function renderTabs(data) {
  const categories = Object.keys(data);
  const orderedCategories = [
    ...CATEGORY_ORDER.filter(cat => categories.includes(cat)),
    ...categories.filter(cat => !CATEGORY_ORDER.includes(cat)),
  ];

  menuTabs.innerHTML = orderedCategories.map((cat, index) => `
    <button class="menu__tab${index === 0 ? ' active' : ''}" data-tab="${escapeHtml(cat)}">${escapeHtml(cat)}</button>
  `).join('');

  return orderedCategories;
}

// Hàm render (vẽ) danh sách món ăn ra HTML, dựa theo category (ví dụ: "Entrées")
function renderMenu(category) {
  const items = currentMenuData[category] || [];
  // .map() biến mỗi món ăn thành 1 đoạn HTML, rồi .join('') nối tất cả lại thành 1 chuỗi
  menuGrid.innerHTML = items.map(item => `
    <div class="menu-card">
      <div class="menu-card__img">${escapeHtml(item.icon)}</div>
      <div class="menu-card__body">
        <div class="menu-card__top">
          <h4>${escapeHtml(item.name)}</h4>
          <span class="menu-card__price">${escapeHtml(item.price)}</span>
        </div>
        <p>${escapeHtml(item.desc)}</p>
      </div>
    </div>
  `).join('');
}

// Lắng nghe sự kiện click trên CẢ khung menuTabs (thay vì từng nút riêng lẻ) — gọi là "event delegation".
// Cách này vẫn hoạt động đúng dù các nút tab được renderTabs() tạo ra SAU khi listener này được gắn.
menuTabs.addEventListener('click', (e) => {
  // e.target.closest('.menu__tab'): tìm nút tab gần nhất chứa phần tử vừa bấm
  const tab = e.target.closest('.menu__tab');
  if (!tab) return; // nếu bấm ra ngoài nút tab thì bỏ qua
  // Bỏ class "active" ở tất cả các tab, rồi chỉ thêm lại cho tab vừa bấm
  menuTabs.querySelectorAll('.menu__tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  // Vẽ lại danh sách món ăn theo danh mục vừa chọn (dataset.tab lấy giá trị của thuộc tính data-tab)
  renderMenu(tab.dataset.tab);
});

// initMenu: hàm khởi động - thử tải thực đơn từ Google Sheets, nếu không được thì dùng dữ liệu dự phòng,
// sau đó vẽ tab + món ăn đầu tiên. Dùng async/await vì tải dữ liệu qua mạng cần thời gian chờ.
(async function initMenu() {
  menuGrid.innerHTML = '<p class="menu-loading">Chargement du menu…</p>';

  const sheetData = await loadMenuFromSheet();
  if (sheetData) currentMenuData = sheetData; // tải thành công -> dùng dữ liệu thật từ Sheets
  // Nếu tải thất bại (sheetData === null), currentMenuData vẫn giữ nguyên giá trị mặc định
  // là FALLBACK_MENU_DATA đã gán lúc khai báo biến ở trên.

  const orderedCategories = renderTabs(currentMenuData);
  if (orderedCategories.length) renderMenu(orderedCategories[0]);
})();

// ============ FORM ĐẶT BÀN: KIỂM TRA DỮ LIỆU (VALIDATION) ============
const form = document.getElementById('reservationForm');
const formSuccess = document.getElementById('formSuccess');

// Hàm hiện/ẩn thông báo lỗi cho 1 ô nhập cụ thể
function setFieldError(group, message) {
  // Thêm/xóa class "invalid" -> CSS sẽ đổi viền ô nhập sang màu đỏ và hiện dòng lỗi (.form-error)
  group.classList.toggle('invalid', Boolean(message));
  const errorEl = group.querySelector('.form-error');
  if (errorEl) errorEl.textContent = message || '';
}

// Hàm kiểm tra toàn bộ form, trả về true nếu hợp lệ, false nếu còn lỗi
function validateForm() {
  let isValid = true;

  // Danh sách các ô bắt buộc, kèm thông báo lỗi tương ứng và mẫu kiểm tra (pattern) nếu cần
  const requiredFields = [
    { id: 'name', message: 'Veuillez saisir votre nom complet.' },
    { id: 'phone', message: 'Veuillez saisir un numéro de téléphone valide.', pattern: /^[0-9+\s]{9,12}$/ },
    { id: 'date', message: 'Veuillez choisir une date de réservation.' },
    { id: 'time', message: 'Veuillez choisir une heure de réservation.' },
    { id: 'guests', message: 'Veuillez choisir le nombre de convives.' },
  ];

  requiredFields.forEach(({ id, message, pattern }) => {
    const field = document.getElementById(id);
    const group = field.closest('.form-group');
    const value = field.value.trim();
    // Nếu có pattern (quy tắc định dạng) và giá trị không khớp -> coi là lỗi
    const failsPattern = pattern && value && !pattern.test(value);

    if (!value || failsPattern) {
      setFieldError(group, message);
      isValid = false;
    } else {
      setFieldError(group, ''); // hợp lệ -> xóa lỗi cũ (nếu có)
    }
  });

  // Email không bắt buộc, nhưng nếu người dùng có nhập thì phải đúng định dạng email
  const emailField = document.getElementById('email');
  const emailGroup = emailField.closest('.form-group');
  const emailValue = emailField.value.trim();
  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    setFieldError(emailGroup, 'Adresse email invalide.');
    isValid = false;
  } else {
    setFieldError(emailGroup, '');
  }

  return isValid;
}

// Khi người dùng bấm nút "Confirmer la réservation"
form.addEventListener('submit', (e) => {
  e.preventDefault(); // ngăn trình duyệt tải lại trang (hành vi mặc định của form)
  formSuccess.classList.remove('show');

  if (!validateForm()) return; // còn lỗi -> dừng lại, không làm gì thêm

  // Lưu ý: đây chỉ là demo phía trình duyệt (frontend), CHƯA gửi dữ liệu đi đâu cả.
  // Muốn lưu vào database / gửi email thật cho nhà hàng thì cần thêm backend (xem gợi ý ở phần chat).
  formSuccess.classList.add('show');
  form.reset();
  setTimeout(() => formSuccess.classList.remove('show'), 6000);
});

// Khi người dùng gõ lại vào 1 ô đang báo lỗi -> tự động xóa lỗi để họ thử lại
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => {
    const group = field.closest('.form-group');
    if (group && group.classList.contains('invalid')) setFieldError(group, '');
  });
});

// ============ HIỆU ỨNG "HIỆN DẦN" KHI CUỘN TỚI (SCROLL REVEAL) ============
// Lấy tất cả phần tử có thuộc tính data-aos (được đặt trong index.html)
const revealEls = document.querySelectorAll('[data-aos]');
// IntersectionObserver: API của trình duyệt để "theo dõi" khi 1 phần tử xuất hiện trong khung nhìn (viewport)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { // phần tử đã lọt vào khung nhìn
      entry.target.classList.add('in-view'); // CSS sẽ chuyển opacity 0 -> 1 (xem [data-aos].in-view)
      observer.unobserve(entry.target); // chỉ chạy hiệu ứng 1 lần, không cần theo dõi tiếp
    }
  });
}, { threshold: 0.15 }); // kích hoạt khi 15% phần tử đã hiện ra

revealEls.forEach(el => observer.observe(el));

// ============ NĂM HIỆN TẠI Ở FOOTER ============
// Tự động điền năm hiện tại vào <span id="year">, không cần sửa tay mỗi năm mới
document.getElementById('year').textContent = new Date().getFullYear();

// ============ GIỚI HẠN NGÀY ĐẶT BÀN ============
// Không cho phép chọn ngày trong quá khứ ở ô "Date" của form đặt bàn
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0]; // định dạng YYYY-MM-DD
  dateInput.min = today;
}

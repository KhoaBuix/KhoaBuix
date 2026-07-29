// ============ DỮ LIỆU THỰC ĐƠN ============
// Đây là "database" tạm thời nằm ngay trong code (chưa có backend thật).
// Mỗi key ("khaivi", "mon-chinh"...) tương ứng với thuộc tính data-tab của nút tab trong index.html.
// Mỗi món ăn là 1 object gồm: icon (emoji thay ảnh), name (tên món), price (giá), desc (mô tả).
const MENU_DATA = {
  khaivi: [
    { icon: '🥗', name: 'Rouleaux de printemps aux crevettes et porc', price: '45.000đ', desc: 'Rouleaux frais aux crevettes, porc, vermicelles et herbes aromatiques, servis avec une sauce nuoc-mâm aigre-douce.' },
    { icon: '🍤', name: 'Nems aux fruits de mer', price: '55.000đ', desc: 'Nems croustillants farcis de crevettes et de calamars, servis avec des herbes fraîches et une sauce spéciale.' },
    { icon: '🥘', name: "Soupe de crabe à l'œuf de cent ans", price: '40.000đ', desc: "Soupe de crabe onctueuse et parfumée, relevée par l'œuf de cent ans." },
  ],
  'mon-chinh': [
    { icon: '🍜', name: 'Pho au bœuf (tendre et poitrine)', price: '65.000đ', desc: 'Bouillon mijoté 12 heures, nouilles de riz moelleuses, fines tranches de bœuf frais.' },
    { icon: '🍲', name: 'Bún bò Huế (soupe épicée de Huế)', price: '60.000đ', desc: 'Saveur épicée typique de Huế, avec jarret de porc et pâté de crabe.' },
    { icon: '🍛', name: 'Riz brisé au porc grillé, couenne et pâté', price: '58.000đ', desc: "Côtelette de porc grillée parfumée, couenne croustillante et pâté d'œuf fondant." },
    { icon: '🐟', name: 'Poisson braisé en pot de terre', price: '85.000đ', desc: 'Poisson mijoté en pot de terre selon une recette familiale, au goût intense et inoubliable.' },
    { icon: '🍚', name: 'Riz frit aux fruits de mer', price: '70.000đ', desc: 'Riz doré sauté avec crevettes, calamars et légumes frais.' },
    { icon: '🍢', name: 'Fondue thaïe aux fruits de mer', price: '250.000đ', desc: 'Fondue acidulée et épicée pour 3 à 4 personnes, généreusement garnie de fruits de mer frais.' },
  ],
  'trang-mieng': [
    { icon: '🍮', name: 'Dessert khúc bạch (gelée de lait aux amandes)', price: '35.000đ', desc: 'Frais et léger, à base de gelée de lait, amandes et longanes.' },
    { icon: '🍨', name: 'Glace au riz gluant et à la noix de coco', price: '38.000đ', desc: 'Glace onctueuse à la noix de coco sur un lit de riz gluant parfumé.' },
    { icon: '🍡', name: 'Flan au caramel', price: '30.000đ', desc: "Onctueux et parfumé, un flan aux œufs et au caramel légèrement amer." },
  ],
  'do-uong': [
    { icon: '🍵', name: 'Thé au lotus doré', price: '32.000đ', desc: 'Thé infusé au lotus naturel, doux et apaisant.' },
    { icon: '🥥', name: 'Eau de coco fraîche', price: '35.000đ', desc: 'Noix de coco fraîche entière, rafraîchissante et désaltérante.' },
    { icon: '☕', name: 'Café glacé au lait concentré', price: '29.000đ', desc: 'Un café corsé, préparé selon la méthode traditionnelle vietnamienne au filtre.' },
  ],
};

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

// ============ TAB LỌC THỰC ĐƠN ============
const menuTabs = document.getElementById('menuTabs'); // khung chứa 4 nút tab
const menuGrid = document.getElementById('menuGrid');  // khung sẽ chứa danh sách món ăn

// Hàm render (vẽ) danh sách món ăn ra HTML, dựa theo category (ví dụ: "khaivi")
function renderMenu(category) {
  const items = MENU_DATA[category] || [];
  // .map() biến mỗi món ăn thành 1 đoạn HTML, rồi .join('') nối tất cả lại thành 1 chuỗi
  menuGrid.innerHTML = items.map(item => `
    <div class="menu-card">
      <div class="menu-card__img">${item.icon}</div>
      <div class="menu-card__body">
        <div class="menu-card__top">
          <h4>${item.name}</h4>
          <span class="menu-card__price">${item.price}</span>
        </div>
        <p>${item.desc}</p>
      </div>
    </div>
  `).join('');
}

// Lắng nghe sự kiện click trên CẢ khung menuTabs (thay vì từng nút riêng lẻ) — gọi là "event delegation"
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

// Hiện sẵn tab "Entrées" (khai vị) ngay khi trang vừa tải
renderMenu('khaivi');

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

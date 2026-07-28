// ===== Data =====
const MENU_DATA = {
  khaivi: [
    { icon: '🥗', name: 'Gỏi cuốn tôm thịt', price: '45.000đ', desc: 'Cuốn tươi mát với tôm, thịt, bún và rau thơm, chấm cùng nước mắm chua ngọt.' },
    { icon: '🍤', name: 'Chả giò hải sản', price: '55.000đ', desc: 'Chả giò giòn rụm nhân tôm mực, ăn kèm rau sống và nước chấm đặc biệt.' },
    { icon: '🥘', name: 'Súp cua trứng bắc thảo', price: '40.000đ', desc: 'Súp cua thơm béo, sánh mịn, kết hợp trứng bắc thảo đậm đà.' },
  ],
  'mon-chinh': [
    { icon: '🍜', name: 'Phở bò tái nạm', price: '65.000đ', desc: 'Nước dùng ninh xương 12 giờ, bánh phở mềm, thịt bò tươi thái mỏng.' },
    { icon: '🍲', name: 'Bún bò Huế', price: '60.000đ', desc: 'Đậm vị cay nồng đặc trưng xứ Huế với giò heo, chả cua.' },
    { icon: '🍛', name: 'Cơm tấm sườn bì chả', price: '58.000đ', desc: 'Sườn nướng thơm lừng, bì giòn, chả trứng béo ngậy.' },
    { icon: '🐟', name: 'Cá kho tộ', price: '85.000đ', desc: 'Cá kho trong niêu đất theo công thức gia truyền, đậm đà khó quên.' },
    { icon: '🍚', name: 'Cơm chiên hải sản', price: '70.000đ', desc: 'Cơm chiên vàng ươm cùng tôm, mực và rau củ tươi.' },
    { icon: '🍢', name: 'Lẩu thái hải sản', price: '250.000đ', desc: 'Lẩu chua cay đậm đà dành cho 3-4 người, đầy ắp hải sản tươi.' },
  ],
  'trang-mieng': [
    { icon: '🍮', name: 'Chè khúc bạch', price: '35.000đ', desc: 'Thanh mát với thạch khúc bạch, hạnh nhân và nhãn.' },
    { icon: '🍨', name: 'Kem xôi dừa', price: '38.000đ', desc: 'Kem dừa béo ngậy trên nền xôi nếp thơm dẻo.' },
    { icon: '🍡', name: 'Bánh flan caramel', price: '30.000đ', desc: 'Mềm mịn, thơm vị trứng sữa hòa quyện caramel đắng nhẹ.' },
  ],
  'do-uong': [
    { icon: '🍵', name: 'Trà sen vàng', price: '32.000đ', desc: 'Trà ướp sen tự nhiên, thanh nhẹ và thư giãn.' },
    { icon: '🥥', name: 'Nước dừa tươi', price: '35.000đ', desc: 'Dừa tươi nguyên trái, mát lạnh giải nhiệt.' },
    { icon: '☕', name: 'Cà phê sữa đá', price: '29.000đ', desc: 'Đậm đà chuẩn vị cà phê phin truyền thống Việt Nam.' },
  ],
};

// ===== Header scroll effect =====
const header = document.getElementById('header');
const backToTop = document.getElementById('backToTop');

function onScroll() {
  const scrolled = window.scrollY > 40;
  header.classList.toggle('scrolled', scrolled);
  backToTop.classList.toggle('show', window.scrollY > 500);
}
window.addEventListener('scroll', onScroll);
onScroll();

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== Mobile nav =====
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

burger.addEventListener('click', () => {
  burger.classList.toggle('open');
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('open');
    nav.classList.remove('open');
  });
});

// ===== Menu tabs =====
const menuTabs = document.getElementById('menuTabs');
const menuGrid = document.getElementById('menuGrid');

function renderMenu(category) {
  const items = MENU_DATA[category] || [];
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

menuTabs.addEventListener('click', (e) => {
  const tab = e.target.closest('.menu__tab');
  if (!tab) return;
  menuTabs.querySelectorAll('.menu__tab').forEach(t => t.classList.remove('active'));
  tab.classList.add('active');
  renderMenu(tab.dataset.tab);
});

renderMenu('khaivi');

// ===== Reservation form validation =====
const form = document.getElementById('reservationForm');
const formSuccess = document.getElementById('formSuccess');

function setFieldError(group, message) {
  group.classList.toggle('invalid', Boolean(message));
  const errorEl = group.querySelector('.form-error');
  if (errorEl) errorEl.textContent = message || '';
}

function validateForm() {
  let isValid = true;

  const requiredFields = [
    { id: 'name', message: 'Vui lòng nhập họ tên.' },
    { id: 'phone', message: 'Vui lòng nhập số điện thoại hợp lệ.', pattern: /^[0-9+\s]{9,12}$/ },
    { id: 'date', message: 'Vui lòng chọn ngày đặt bàn.' },
    { id: 'time', message: 'Vui lòng chọn giờ đặt bàn.' },
    { id: 'guests', message: 'Vui lòng chọn số khách.' },
  ];

  requiredFields.forEach(({ id, message, pattern }) => {
    const field = document.getElementById(id);
    const group = field.closest('.form-group');
    const value = field.value.trim();
    const failsPattern = pattern && value && !pattern.test(value);

    if (!value || failsPattern) {
      setFieldError(group, message);
      isValid = false;
    } else {
      setFieldError(group, '');
    }
  });

  const emailField = document.getElementById('email');
  const emailGroup = emailField.closest('.form-group');
  const emailValue = emailField.value.trim();
  if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
    setFieldError(emailGroup, 'Email không hợp lệ.');
    isValid = false;
  } else {
    setFieldError(emailGroup, '');
  }

  return isValid;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formSuccess.classList.remove('show');

  if (!validateForm()) return;

  formSuccess.classList.add('show');
  form.reset();
  setTimeout(() => formSuccess.classList.remove('show'), 6000);
});

// clear error state as the user types/selects
form.querySelectorAll('input, select, textarea').forEach(field => {
  field.addEventListener('input', () => {
    const group = field.closest('.form-group');
    if (group && group.classList.contains('invalid')) setFieldError(group, '');
  });
});

// ===== Scroll reveal animation =====
const revealEls = document.querySelectorAll('[data-aos]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach(el => observer.observe(el));

// ===== Footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Min date for reservation =====
const dateInput = document.getElementById('date');
if (dateInput) {
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
}

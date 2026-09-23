const store = {
  get(key, fallback = {}) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

function saveForm(form, key, nextPage) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form).entries());
    store.set(key, { ...store.get(key), ...values });
    const message = form.querySelector('.form-message');
    if (message) message.textContent = 'Saved successfully.';
    if (nextPage) setTimeout(() => location.href = nextPage, 450);
  });
}

function restoreForm(form, key) {
  const values = store.get(key);
  Object.entries(values).forEach(([name, value]) => { const field = form.elements[name]; if (field && field.type !== 'file') field.value = value; });
}

document.querySelectorAll('form[data-store]').forEach(form => { restoreForm(form, form.dataset.store); saveForm(form, form.dataset.store, form.dataset.next); });

if (document.body.classList.contains('portfolio-page')) {
  const personal = store.get('personal'); const education = store.get('education'); const skills = store.get('skills'); const project = store.get('project');
  document.querySelector('[data-name]').textContent = personal.name || 'Your Name';
  document.querySelector('[data-email]').textContent = personal.email || 'Add your email';
  document.querySelector('[data-about]').textContent = personal.phone ? `Phone: ${personal.phone}` : 'Add your personal details from the dashboard.';
  document.querySelector('[data-education]').textContent = education.college ? `${education.degree || 'Degree'} in ${education.branch || 'your branch'} — ${education.college} (${education.year || 'Year'}) | CGPA: ${education.cgpa || '—'}` : 'No education details added yet.';
  document.querySelector('[data-skills]').innerHTML = skills.skill ? `<span class="chip">${skills.skill}${skills.level ? ` · ${skills.level}` : ''}</span>` : '<span class="empty">No skills added yet.</span>';
  document.querySelector('[data-project]').innerHTML = project.title ? `<div class="project-card"><strong>${project.title}</strong><p>${project.description || ''}</p>${project.link ? `<a href="${project.link}" target="_blank" rel="noopener">View project</a>` : ''}</div>` : '<p class="empty">No projects added yet.</p>';
}

const preferredTheme = localStorage.getItem('theme-preference');
if (preferredTheme === 'dark') {
  document.body.classList.add('theme-dark');
} else {
  document.body.classList.remove('theme-dark');
}

const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const syncThemeLabel = () => {
    const dark = document.body.classList.contains('theme-dark');
    themeToggle.textContent = dark ? '☀️' : '🌙';
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  };

  syncThemeLabel();
  themeToggle.addEventListener('click', () => {
    const nextDark = !document.body.classList.contains('theme-dark');
    document.body.classList.toggle('theme-dark', nextDark);
    localStorage.setItem('theme-preference', nextDark ? 'dark' : 'light');
    syncThemeLabel();
  });
}

const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
  const button = item.querySelector('.faq-question');
  if (!button) return;

  button.addEventListener('click', () => {
    const shouldOpen = !item.classList.contains('active');

    faqItems.forEach(otherItem => {
      const otherButton = otherItem.querySelector('.faq-question');
      otherItem.classList.remove('active');
      if (otherButton) otherButton.setAttribute('aria-expanded', 'false');
    });

    item.classList.toggle('active', shouldOpen);
    button.setAttribute('aria-expanded', String(shouldOpen));
  });
});

const notificationBanner = document.getElementById('notificationBanner');
if (notificationBanner) {
  setTimeout(() => notificationBanner.classList.add('show'), 300);
  const dismissButton = notificationBanner.querySelector('.dismiss-btn');
  dismissButton?.addEventListener('click', () => notificationBanner.classList.remove('show'));
}

const slides = Array.from(document.querySelectorAll('.slide'));
const prevButton = document.querySelector('.slider-btn.prev');
const nextButton = document.querySelector('.slider-btn.next');
if (slides.length && prevButton && nextButton) {
  let currentSlide = 0;

  const showSlide = index => {
    slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === index));
  };

  prevButton.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
  });

  nextButton.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  });

  setInterval(() => {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
  }, 3000);
}

const modal = document.getElementById('studentModal');
const openModalButton = document.getElementById('openModalBtn');
const closeModalButton = document.getElementById('closeModalBtn');
if (modal && openModalButton && closeModalButton) {
  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  openModalButton.addEventListener('click', () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  });

  closeModalButton.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}


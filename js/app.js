const store = {
  get(key, fallback = {}) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

function saveForm(form, key, nextPage) {
  if (form.dataset.validation === 'registration') return;
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

const registrationForm = document.querySelector('form[data-validation="registration"]');
if (registrationForm) {
  const rules = {
    name: value => /^[A-Za-z][A-Za-z .'\-]{1,49}$/.test(value.trim()) ? '' : 'Enter a name using 2–50 letters, spaces, or . \' - characters.',
    email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address, for example name@example.com.',
    mobile: value => /^\d{10}$/.test(value.trim()) ? '' : 'Enter exactly 10 digits without spaces or symbols.',
    password: value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(value) ? '' : 'Use 8+ characters including uppercase, lowercase, a number, and a special character.',
    confirmPassword: value => value === registrationForm.elements.password.value && value !== '' ? '' : 'Passwords do not match.',
    course: value => value ? '' : 'Select your course.',
    year: value => /^(?:[1-4])$/.test(value) ? '' : 'Enter a year from 1 to 4.',
    gender: () => registrationForm.querySelector('input[name="gender"]:checked') ? '' : 'Select a gender option.',
    terms: () => registrationForm.elements.terms.checked ? '' : 'You must accept the terms and conditions.'
  };

  const setFieldState = (name, message) => {
    const input = registrationForm.elements[name];
    const field = name === 'gender' ? registrationForm.querySelector('.choice-field') : input.closest('.field');
    const error = document.getElementById(`${name}-error`);
    field.classList.toggle('invalid', Boolean(message));
    field.classList.toggle('valid', !message && (name === 'gender' || name === 'terms' ? true : Boolean(input.value)));
    if (error) error.textContent = message;
    if (name === 'gender') Array.from(input).forEach(radio => radio.setAttribute('aria-invalid', String(Boolean(message))));
    else if (name !== 'terms') input.setAttribute('aria-invalid', String(Boolean(message)));
    return !message;
  };

  const passwordStrength = value => {
    const meter = registrationForm.querySelector('.strength-meter');
    const text = registrationForm.querySelector('.strength-text');
    const score = [value.length >= 8, /[a-z]/.test(value), /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9\s]/.test(value)].filter(Boolean).length;
    const level = !value ? '' : score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong';
    meter.className = `strength-meter ${level}`;
    text.textContent = `Password strength: ${level || 'not set'}`;
  };

  const validate = name => {
    const input = registrationForm.elements[name];
    const value = input && input.type === 'checkbox' ? input.checked : input?.value || '';
    const message = rules[name](value);
    if (name === 'password') passwordStrength(value);
    return setFieldState(name, message);
  };

  Object.keys(rules).forEach(name => {
    const inputs = name === 'gender' ? registrationForm.querySelectorAll('input[name="gender"]') : [registrationForm.elements[name]];
    inputs.forEach(input => input.addEventListener('input', () => {
      validate(name);
      if (name === 'password' && registrationForm.elements.confirmPassword.value) validate('confirmPassword');
    }));
    inputs.forEach(input => input.addEventListener('change', () => validate(name)));
  });

  registrationForm.addEventListener('submit', event => {
    event.preventDefault();
    const valid = Object.keys(rules).map(validate).every(Boolean);
    const message = registrationForm.querySelector('.form-message');
    if (!valid) {
      message.classList.remove('success');
      message.textContent = 'Please correct the highlighted fields before registering.';
      registrationForm.querySelector('.invalid input, .invalid select')?.focus();
      return;
    }
    const values = Object.fromEntries(new FormData(registrationForm).entries());
    delete values.confirmPassword;
    delete values.terms;
    store.set(registrationForm.dataset.store, { ...store.get(registrationForm.dataset.store), ...values });
    message.classList.add('success');
    message.textContent = 'Registration successful. Opening your dashboard…';
    setTimeout(() => location.href = registrationForm.dataset.next, 700);
  });
}

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

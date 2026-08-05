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

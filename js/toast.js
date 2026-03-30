let container = null;

function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed; bottom: 120px; right: 30px; z-index: 10000;
      display: flex; flex-direction: column; gap: 10px; align-items: flex-end;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
}

export function toast(message, type = 'info', duration = 2500) {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  el.style.cssText = `
    padding: 14px 24px; border-radius: 10px; font-weight: 600;
    font-size: 0.95rem; pointer-events: auto; cursor: pointer;
    transform: translateX(120%); transition: transform 0.35s ease, opacity 0.35s ease;
    max-width: 340px; word-wrap: break-word;
    ${typeStyles[type] || typeStyles.info}
  `;

  const c = ensureContainer();
  c.appendChild(el);
  requestAnimationFrame(() => { el.style.transform = 'translateX(0)'; });

  const dismiss = () => {
    el.style.transform = 'translateX(120%)';
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 350);
  };
  el.addEventListener('click', dismiss);
  if (duration > 0) setTimeout(dismiss, duration);
  return dismiss;
}

const typeStyles = {
  info: 'background: rgba(20,0,5,0.95); color: #ffebf0; border-left: 4px solid #e11d48;',
  success: 'background: rgba(6,78,59,0.95); color: #a7f3d0; border-left: 4px solid #10b981;',
  error: 'background: rgba(127,29,29,0.95); color: #fecaca; border-left: 4px solid #ef4444;',
  warning: 'background: rgba(124,45,18,0.95); color: #fed7aa; border-left: 4px solid #f97316;',
  copy: 'background: rgba(6,78,59,0.95); color: #a7f3d0; border-left: 4px solid #10b981;'
};

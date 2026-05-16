// ============================================================
//  The Grimoire — Shared Nav (no login required)
//  DM mode: click "DM" in the nav and enter your password.
//  Change DM_PASSWORD below to whatever you want.
// ============================================================

const DM_PASSWORD = 'grimoire'; // ← change this to your secret password

const NAV_HTML = `
<nav class="grimoire-nav">
  <div class="nav-inner">
    <a href="/grimoire/index.html" class="nav-logo">The Grimoire</a>

    <ul class="nav-links" id="nav-links">
      <li><a href="/grimoire/pages/spells.html"     data-page="spells">Spells</a></li>
      <li><a href="/grimoire/pages/bestiary.html"   data-page="bestiary">Bestiary</a></li>
      <li><a href="/grimoire/pages/wiki.html"        data-page="wiki">Campaign Wiki</a></li>
      <li><a href="/grimoire/pages/rules.html"       data-page="rules">Quick Rules</a></li>
    </ul>

    <div class="nav-auth">
      <span id="dm-badge" style="display:none;font-family:var(--font-display);font-size:0.55rem;
        letter-spacing:0.1em;text-transform:uppercase;padding:0.2rem 0.6rem;
        background:rgba(139,0,0,0.3);color:#d46060;border:1px solid rgba(139,0,0,0.5);
        border-radius:2px;">⚔ DM Mode</span>
      <button class="btn-ghost" id="dm-btn" onclick="toggleDM()">DM</button>
    </div>

    <button class="nav-mobile-toggle" id="nav-toggle" aria-label="Toggle menu">☰</button>
  </div>
</nav>
`;

export function isDM() {
  return sessionStorage.getItem('dm') === 'true';
}

export function initNav() {
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector(`[data-page="${page}"]`);
    if (link) link.classList.add('active');
  }

  document.getElementById('nav-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });

  if (isDM()) {
    document.getElementById('dm-badge').style.display = 'inline-block';
    document.getElementById('dm-btn').textContent = 'Exit DM';
  }
}

window.toggleDM = function() {
  if (isDM()) {
    sessionStorage.removeItem('dm');
    location.reload();
  } else {
    const pw = prompt('Enter DM password:');
    if (pw === DM_PASSWORD) {
      sessionStorage.setItem('dm', 'true');
      location.reload();
    } else if (pw !== null) {
      alert('Incorrect password.');
    }
  }
};

export function toast(msg, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast${type === 'error' ? ' error' : ''}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

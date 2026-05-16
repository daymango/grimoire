// ============================================================
//  The Grimoire — Shared Nav + Auth UI
// ============================================================

import { getUser, getRole, signOut } from './supabase.js';

const NAV_HTML = `
<nav class="grimoire-nav">
  <div class="nav-inner">
    <a href="/grimoire/index.html" class="nav-logo">The Grimoire</a>

    <ul class="nav-links" id="nav-links">
      <li><a href="/grimoire/pages/spells.html"     data-page="spells">Spells</a></li>
      <li><a href="/grimoire/pages/bestiary.html"   data-page="bestiary">Bestiary</a></li>
      <li><a href="/grimoire/pages/characters.html" data-page="characters">Characters</a></li>
      <li><a href="/grimoire/pages/wiki.html"        data-page="wiki">Campaign Wiki</a></li>
      <li><a href="/grimoire/pages/rules.html"       data-page="rules">Quick Rules</a></li>
    </ul>

    <div class="nav-auth" id="nav-auth">
      <span id="nav-role-badge" style="display:none"></span>
      <button class="btn-ghost" id="nav-auth-btn">Sign In</button>
    </div>

    <button class="nav-mobile-toggle" id="nav-toggle" aria-label="Toggle menu">☰</button>
  </div>
</nav>
`;

export async function initNav() {
  // Inject nav
  document.body.insertAdjacentHTML('afterbegin', NAV_HTML);

  // Mark active page
  const page = document.body.dataset.page;
  if (page) {
    const link = document.querySelector(`[data-page="${page}"]`);
    if (link) link.classList.add('active');
  }

  // Mobile toggle
  document.getElementById('nav-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });

  // Auth state
  const user = await getUser();
  const authBtn = document.getElementById('nav-auth-btn');
  const roleBadge = document.getElementById('nav-role-badge');

  if (user) {
    const role = await getRole();
    authBtn.textContent = 'Sign Out';
    authBtn.addEventListener('click', signOut);
    if (role === 'dm') {
      roleBadge.style.display = 'inline-block';
      roleBadge.textContent = '⚔ DM';
      roleBadge.style.cssText = `
        display:inline-block;font-family:var(--font-display);font-size:0.55rem;
        letter-spacing:0.1em;text-transform:uppercase;padding:0.2rem 0.6rem;
        background:rgba(139,0,0,0.3);color:#d46060;border:1px solid rgba(139,0,0,0.5);
        border-radius:2px;`;
    } else {
      roleBadge.style.display = 'inline-block';
      roleBadge.textContent = '✦ ' + (user.email?.split('@')[0] ?? 'Player');
      roleBadge.style.cssText = `
        display:inline-block;font-family:var(--font-display);font-size:0.55rem;
        letter-spacing:0.1em;text-transform:uppercase;padding:0.2rem 0.6rem;
        background:rgba(201,151,42,0.2);color:#e8b84b;border:1px solid rgba(201,151,42,0.4);
        border-radius:2px;`;
    }
  } else {
    authBtn.addEventListener('click', () => {
      window.location.href = '/grimoire/pages/login.html';
    });
  }
}

// Toast helper — call toast('Message') from any page
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

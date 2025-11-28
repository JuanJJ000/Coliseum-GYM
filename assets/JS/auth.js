// assets/JS/auth.js
const STRAPI_URL = "http://localhost:1337";

function getJwt() { return localStorage.getItem("jwt"); }
function clearAuth() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
}
function saveUser(user) {
  try { localStorage.setItem("user", JSON.stringify(user)); } catch(e) {}
}

async function fetchCurrentUser() {
  const jwt = getJwt();
  if (!jwt) return null;

  const urls = [
    `${STRAPI_URL}/api/users/me`,
    `${STRAPI_URL}/users/me`,
    `${STRAPI_URL}/api/users/me?populate=*`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` }});
      if (res.status === 401 || res.status === 403) return null;
      if (!res.ok) continue;
      const data = await res.json();
      let user = null;
      if (data?.data) {
        user = data.data;
        if (user && user.attributes) user = { id: user.id, ...user.attributes };
      } else if (data?.user) user = data.user;
      else user = data;
      saveUser(user);
      return user;
    } catch (err) {
      console.error("[auth] fetchCurrentUser error for", url, err);
    }
  }
  return null;
}

async function renderHeader() {
  const container = document.getElementById("header-cta");
  if (!container) return;

  const stored = localStorage.getItem("user");
  if (stored) {
    try {
      const localUser = JSON.parse(stored);
      container.innerHTML = quickLoggedHTML(localUser);
    } catch(e) {
      container.innerHTML = `<a class="btn btn-outline" href="Auth/Login.html">Login</a>`;
    }
  } else {
    container.innerHTML = `<a class="btn btn-outline" href="Auth/Login.html">Login</a>`;
  }

  const user = await fetchCurrentUser();
  if (!user) {
    container.innerHTML = `<a class="btn btn-outline" href="Auth/Login.html">Login</a>`;
    return;
  }

  const username = user.username || user.name || user.email || "Usuario";

  container.innerHTML = `
    <div style="display:flex; align-items:center; gap:.6rem">
      <button id="cart-btn" class="btn btn-ghost" title="Carrito">🛒</button>
      <span class="muted" id="header-username" style="font-weight:700;cursor:default">${username}</span>
      <a id="dashboard-link" class="btn btn-outline" href="/Public/Dashboard.html">Dashboard</a>
      <button id="logout-btn" class="btn btn-secondary">Logout</button>
    </div>
  `;

  document.getElementById("logout-btn").addEventListener("click", () => {
    clearAuth();
    window.location.href = "/Principal.html";
  });
  document.getElementById("cart-btn").addEventListener("click", () => {
    alert("Carrito (placeholder)");
  });
}

function quickLoggedHTML(user) {
  const username = user?.username || user?.name || user?.email || "Usuario";
  return `
    <div style="display:flex;align-items:center;gap:.6rem">
      <button id="cart-btn" class="btn btn-ghost">🛒</button>
      <span class="muted" style="font-weight:700">${username}</span>
      <a class="btn btn-outline" href="/Public/Dashboard.html">Dashboard</a>
      <button id="logout-btn" class="btn btn-secondary">Logout</button>
    </div>
  `;
}

async function initHeader() {
  try { await renderHeader(); } 
  catch (e) { console.error("[auth] initHeader error", e); }
}

// assets/JS/auth.js (versión con logs y fallback localStorage)
const STRAPI_URL = "http://localhost:1337";

function getJwt() { return localStorage.getItem("jwt"); }
function clearAuth() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
}
function saveUser(user) {
  try { localStorage.setItem("user", JSON.stringify(user)); } catch(e) {}
}

// Intenta múltiples endpoints y maneja varias formas de respuesta
async function fetchCurrentUser() {
  const jwt = getJwt();
  if (!jwt) {
    console.debug("[auth] no jwt in localStorage");
    return null;
  }

  const urls = [
    `${STRAPI_URL}/api/users/me`,
    `${STRAPI_URL}/users/me`,
    `${STRAPI_URL}/api/users/me?populate=*`
  ];

  for (const url of urls) {
    try {
      console.debug("[auth] fetching user from", url);
      const res = await fetch(url, { headers: { Authorization: `Bearer ${jwt}` }});
      // 401/403: token inválido o sin permisos
      if (res.status === 401 || res.status === 403) {
        console.warn("[auth] fetch returned 401/403 -> token inválido o expirado");
        return null;
      }
      if (!res.ok) {
        console.debug("[auth] fetch not ok:", res.status, res.statusText);
        continue;
      }
      const data = await res.json();
      // Strapi v4 puede devolver { data: { id, attributes: {...} } } o bien el user directo.
      let user = null;
      if (data?.data) {
        // caso v4: data.data o data.data.attributes
        user = data.data;
        // si es {id, attributes}, convertir a forma usable:
        if (user && user.attributes) {
          user = { id: user.id, ...user.attributes };
        }
      } else if (data?.user) {
        user = data.user;
      } else {
        user = data;
      }
      saveUser(user);
      console.debug("[auth] user fetched", user);
      return user;
    } catch (err) {
      console.error("[auth] fetchCurrentUser error for", url, err);
    }
  }
  return null;
}

async function renderHeader() {
  const container = document.getElementById("header-cta");
  if (!container) {
    console.warn("[auth] #header-cta not found");
    return;
  }

  // Renderiza rápido desde localStorage para mejor UX mientras valida en background
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

  // Verificación con backend en background
  const user = await fetchCurrentUser();
  if (!user) {
    // si la verificación falló y habíamos mostrado user local, revertir a Login
    container.innerHTML = `<a class="btn btn-outline" href="Auth/Login.html">Login</a>`;
    return;
  }

  // extraer nombre y rol robustamente
  const username = user.username || user.name || user.email || "Usuario";
  let role = "";
  if (user.role && user.role.name) role = user.role.name;
  else if (user.role) role = user.role;
  else if (user.attributes && user.attributes.role) role = user.attributes.role;
  role = (role || "").toString();

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
  try {
    await renderHeader();
  } catch (e) {
    console.error("[auth] initHeader error", e);
  }
}

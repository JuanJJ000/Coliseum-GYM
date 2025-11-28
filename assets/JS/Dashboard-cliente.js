async function initDashboard() {
  // render header dinamico
  if (typeof initHeader === "function") await initHeader();

  // validar sesión con backend
  const user = await fetchCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para acceder al Dashboard.");
    window.location.href = "/Principal.html";
    return;
  }

  // menú base
  const sidebar = document.getElementById("dash-sidebar");
  const contentTitle = document.getElementById("dash-title");
  const contentBody = document.getElementById("dash-body");
  sidebar.innerHTML = "";

  // Items comunes
  const items = [
    { id: "inicio", label: "Inicio", handler: showHome },
    { id: "perfil", label: "Mi Perfil", handler: showProfile },
    // Cambiar "reservas" por "mis reservas" para mayor claridad ----------------------
    { id: "reservas", label: "Reservas", handler: showReservations },
    { id: "progreso", label: "Progreso físico", handler: showProgress },
    { id: "carrito", label: "Carrito", handler: showCart }
  ];

  // render sidebar
  items.forEach(it => {
    const btn = document.createElement("button");
    btn.className = "btn btn-ghost";
    btn.style.display = "block";
    btn.style.width = "100%";
    btn.style.marginBottom = ".5rem";
    btn.textContent = it.label;
    btn.addEventListener("click", async () => {
      contentTitle.textContent = it.label;
      contentBody.innerHTML = "<p>Cargando...</p>";
      await it.handler(contentBody, user, isAdmin);
    });
    sidebar.appendChild(btn);
  });

  // auto mostrar inicio
  document.querySelector("#dash-sidebar button")?.click();
}

async function doLogout() {
  clearAuth();
  window.location.href = "/Principal.html";
}

/* ---- Secciones (ejemplos simples, expandibles) ---- */

async function showHome(container) {
  container.innerHTML = `
    <p class="muted">Bienvenido al Dashboard.</p>
    <p>Accede a las opciones del menú a la izquierda. Tu rol: <strong>${(await fetchCurrentUser()).role?.name || 'error al encontrar el rol'}</strong></p>
  `;
}

async function showProfile(container) {
  const user = await fetchCurrentUser();
  container.innerHTML = `
    <h3>Perfil</h3>
    <p><strong>Usuario:</strong> ${user.username || user.email}</p>
    <p><strong>Email:</strong> ${user.email || "-"}</p>
    <button id="edit-profile" class="btn btn-outline">Editar (placeholder)</button>
  `;
}

async function showReservations(container) {
  // ejemplo: pedir reservas del usuario
  const jwt = getJwt();
  try {
    const res = await fetch(`${STRAPI_URL}/api/reservas?filters[user][id][$eq]=${(await fetchCurrentUser()).id}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) throw new Error("No se pudieron cargar las reservas.");
    const data = await res.json();
    const reservas = data.data || [];
    container.innerHTML = `<h3>Mis reservas</h3>
      ${reservas.length ? "<ul>" + reservas.map(r=>`<li>${r.attributes?.servicioNombre || 'Reserva'} - ${r.attributes?.fecha || ''}</li>`).join("") + "</ul>" : "<p>No tienes reservas.</p>"}
    `;
  } catch (e) {
    container.innerHTML = `<p class="muted">Error cargando reservas.</p>`;
  }
}

async function showProgress(container) {
  const user = await fetchCurrentUser();
  // ejemplo: mostrar datos ficticios o pedir al endpoint /api/progreso?user=...
  container.innerHTML = `<h3>Progreso físico</h3><p class="muted">Módulo en desarrollo. Aquí se mostrarían peso, IMC y evolución.</p>`;
}

async function showCart(container) {
  container.innerHTML = `<h3>Carrito</h3><p class="muted">Pedidos pendientes por pagar en recepción.</p>`;
}

/* arranque */
document.addEventListener("DOMContentLoaded", initDashboard);
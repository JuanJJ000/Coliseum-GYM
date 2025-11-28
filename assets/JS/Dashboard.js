// assets/JS/Dashboard.js

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
  // detectar rol (ajustar según la estructura que devuelva Strapi)
  let roleName = "";
  if (user.role && user.role.name) roleName = user.role.name;
  else if (user.user && user.user.role && user.user.role.name) roleName = user.user.role.name;
  
  // menú base
  const sidebar = document.getElementById("dash-sidebar");
  const contentTitle = document.getElementById("dash-title");
  const contentBody = document.getElementById("dash-body");
  sidebar.innerHTML = "";

  // Items comunes
  const items = [
    { id: "inicio", label: "Inicio", handler: showHome },
    { id: "perfil", label: "Mi Perfil", handler: showProfile },
    { id: "reservas", label: "Reservas", handler: showReservations },
  ];

  // Si admin/propietario añadimos items extra
  const isAdmin = (roleName.toLowerCase() === "owner" || roleName.toLowerCase() === "Administrador" || roleName.toLowerCase() === "Usuario");
  if (isAdmin) {
    items.push(
      { id: "admin-products", label: "Productos (CRUD)", handler: showAdminProducts },
      { id: "admin-servicios", label: "Servicios (CRUD)", handler: showAdminServices },
      { id: "admin-clientes", label: "Clientes", handler: showAdminClients },
      { id: "reportes", label: "Reportes", handler: showReports}
    );
  } else {
    // cliente obtiene progreso y carrito
    items.push(
      { id: "progreso", label: "Progreso físico", handler: showProgress },
      { id: "carrito", label: "Carrito", handler: showCart }
    );
  }

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
    <p><strong>Rol:</strong> ${user.role?.name || "-"}</p>
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

/* ---- Admin functions ---- */
async function showAdminProducts(container) {
  const jwt = getJwt();
  try {
    const res = await fetch(`${STRAPI_URL}/api/productos?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) throw new Error("Error");
    const data = await res.json();
    const productos = data.data || [];
    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3>Productos</h3>
        <button id="new-product" class="btn btn-primary">Nuevo producto</button>
      </div>
      <div id="prod-list">${productos.map(p => `
        <div class="card" style="padding:.6rem;margin:.4rem 0">
          <strong>${p.attributes.Nombre}</strong>
          <div class="muted">${p.attributes.Descripcion || ''}</div>
          <div style="margin-top:.5rem">
            <button class="btn btn-outline" data-id="${p.id}" data-act="edit">Editar</button>
            <button class="btn btn-secondary" data-id="${p.id}" data-act="delete">Eliminar</button>
          </div>
        </div>
      `).join("")}</div>
    `;

    // listeners para borrar (ejemplo)
    container.querySelectorAll("button[data-act='delete']").forEach(b => {
      b.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (!confirm("Eliminar producto?")) return;
        try {
          const r = await fetch(`${STRAPI_URL}/api/productos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }
          });
          if (!r.ok) throw new Error("Error al eliminar");
          alert("Eliminado");
          showAdminProducts(container);
        } catch (err) {
          alert("No se pudo eliminar (verifica permisos en backend).");
        }
      });
    });

    // new product handler (placeholder)
    document.getElementById("new-product").addEventListener("click", () => {
      alert("Formulario para crear producto (placeholder).");
    });

  } catch (err) {
    container.innerHTML = `<p class="muted">No se pudo cargar la lista de productos. Asegúrate que tu token tiene permisos administrativos.</p>`;
  }
}

async function showAdminServices(container) {
  container.innerHTML = `<h3>Servicios</h3><p class="muted">CRUD de servicios (implementación similar a productos).</p>`;
}

async function showAdminClients(container) {
  container.innerHTML = `<h3>Clientes</h3><p class="muted">Listado y gestión de clientes.</p>`;
}

async function showReports(container) {
  container.innerHTML = `<h3>Reportes</h3><p class="muted">Estadísticas de ventas, ocupación y reservas.</p>`;
}

/* arranque */
document.addEventListener("DOMContentLoaded", initDashboard);

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof initHeader === "function") await initHeader();

  const user = await fetchCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "/Principal.html";
    return;
  }

  await loadReportes();
});

async function loadReportes() {
  const jwt = localStorage.getItem("jwt");

  await loadProductos(jwt);
  await loadCategorias(jwt);
  await loadClientes(jwt);
}

// -----------------------------
// PRODUCTOS
// -----------------------------
async function loadProductos(jwt) {
  const tbody = document.querySelector("#productos-report tbody");
  tbody.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${STRAPI_URL}/api/productos?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    const productos = data.data || [];

    if (!productos.length) {
      tbody.innerHTML = "<tr><td colspan='7'>No hay productos.</td></tr>";
      return;
    }

    tbody.innerHTML = productos.map(p => `
      <tr>
        <td>${p.Nombre || ""}</td>
        <td>${p.Descripcion || ""}</td>
        <td>${p.Precio || 0}</td>
        <td>${p.Stock || 0}</td>
        <td>${p.categoria?.NombreCategoria || ""}</td>
        <td>${p.descuento?.Titulo || ""}</td>
        <td>${p.Estado ? "Activo" : "Inactivo"}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='7'>Error cargando productos.</td></tr>";
  }
}

// -----------------------------
// CATEGORÍAS
// -----------------------------
async function loadCategorias(jwt) {
  const tbody = document.querySelector("#categorias-report tbody");
  tbody.innerHTML = "<tr><td colspan='3'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${STRAPI_URL}/api/categorias?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    const categorias = data.data || [];

    if (!categorias.length) {
      tbody.innerHTML = "<tr><td colspan='3'>No hay categorías.</td></tr>";
      return;
    }

    tbody.innerHTML = categorias.map(c => `
      <tr>
        <td>${c.NombreCategoria || ""}</td>
        <td>${c.Descripcion || ""}</td>
        <td>${c.Estado ? "Activo" : "Inactivo"}</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='3'>Error cargando categorías.</td></tr>";
  }
}

// -----------------------------
// CLIENTES
// -----------------------------
async function loadClientes(jwt) {
  const tbody = document.querySelector("#clientes-report tbody");
  tbody.innerHTML = "<tr><td colspan='3'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${STRAPI_URL}/api/users?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const clientes = await res.json();

    if (!clientes.length) {
      tbody.innerHTML = "<tr><td colspan='3'>No hay clientes.</td></tr>";
      return;
    }

    tbody.innerHTML = clientes.map(c => `
      <tr>
        <td>${c.nombre || c.username || "Sin nombre"}</td>
        <td>${c.email || "Sin email"}</td>
        <td>${c.username || "-"}</td>
      </tr>
    `).join("");

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='3'>Error cargando clientes.</td></tr>";
  }
}

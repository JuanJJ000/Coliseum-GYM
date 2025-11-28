// assets/JS/clientes.js



document.addEventListener("DOMContentLoaded", async () => {
  // Header dinámico
  if (typeof initHeader === "function") await initHeader();

  // Validar sesión
  const user = await fetchCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "/Principal.html";
    return;
  }

  // Cargar clientes
  await loadClientes();
});

async function loadClientes() {
  const jwt = localStorage.getItem("jwt");
  const tbody = document.querySelector("#clientes-table tbody");
  tbody.innerHTML = "<tr><td colspan='4'>Cargando...</td></tr>";

  console.log("JWT actual:", jwt);
  console.log("URL:", `${STRAPI_URL}/api/users`);

  try {
    const res = await fetch(`${STRAPI_URL}/api/users?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    if (!res.ok) throw new Error("No se pudieron cargar los clientes");

    const clientes = await res.json();

    console.log("Data completa de Strapi (clientes):", clientes);

    if (!clientes.length) {
      tbody.innerHTML = "<tr><td colspan='4'>No hay clientes.</td></tr>";
      return;
    }

    tbody.innerHTML = clientes.map(cli => {
      return `
        <tr>
          <td>${cli.nombre || cli.username || "Sin nombre"}</td>
          <td>${cli.email || "Sin email"}</td>
          <td>${cli.username || "-"}</td>
          <td>
            <button class="btn btn-outline" data-id="${cli.id}" data-act="edit">Editar</button>
            <button class="btn btn-secondary" data-id="${cli.id}" data-act="delete">Eliminar</button>
          </td>
        </tr>
      `;
    }).join("");

    // Listeners placeholder
    document.querySelectorAll("button[data-act='edit']").forEach(btn => {
      btn.addEventListener("click", () => {
        alert("Editar cliente ID: " + btn.dataset.id + " (placeholder)");
      });
    });

    document.querySelectorAll("button[data-act='delete']").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Eliminar cliente?")) return;

        try {
          const id = btn.dataset.id;
          const r = await fetch(`${STRAPI_URL}/api/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${jwt}` }
          });
          if (!r.ok) throw new Error("Error al eliminar");
          alert("Cliente eliminado");
          loadClientes();
        } catch (err) {
          alert("No se pudo eliminar el cliente.");
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='4'>Error cargando clientes.</td></tr>";
  }
}

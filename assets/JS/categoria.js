// assets/JS/categoria.js



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

  // Cargar categorías
  await loadCategorias();
});

async function loadCategorias() {
  const jwt = localStorage.getItem("jwt");
  const tbody = document.querySelector("#categoria-table tbody");
  tbody.innerHTML = "<tr><td colspan='4'>Cargando...</td></tr>";
  //console.log("JWT actual:", jwt);
  //console.log("URL:", `${STRAPI_URL}/api/categorias?populate=*`);

  try {
    const res = await fetch(`${STRAPI_URL}/api/categorias?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    if (!res.ok) throw new Error("No se pudieron cargar las categorías");

    const data = await res.json();
    const categorias = data.data || [];
    console.log("Data completa de Strapi:", categorias);  // <- AQUÍ


    if (!categorias.length) {
      tbody.innerHTML = "<tr><td colspan='4'>No hay categorías.</td></tr>";
      return;
    }

    tbody.innerHTML = categorias.map(cat => {
  return `
    <tr>
      <td>${cat.NombreCategoria || ""}</td>
      <td>${cat.Descripcion || ""}</td>
      <td>${cat.Estado ? "Activo" : "Inactivo"}</td>
      <td>
        <button class="btn btn-outline" data-id="${cat.id}" data-act="edit">Editar</button>
        <button class="btn btn-secondary" data-id="${cat.id}" data-act="delete">Eliminar</button>
      </td>
    </tr>
  `;
}).join("");

    // listeners para botones (placeholder)
    document.querySelectorAll("button[data-act='edit']").forEach(btn => {
      btn.addEventListener("click", () => {
        alert("Editar categoría ID: " + btn.dataset.id + " (placeholder)");
      });
    });

    document.querySelectorAll("button[data-act='delete']").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Eliminar categoría?")) return;
        try {
          const id = btn.dataset.id;
          const r = await fetch(`${STRAPI_URL}/api/categorias/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }
          });
          if (!r.ok) throw new Error("Error al eliminar");
          alert("Categoría eliminada");
          loadCategorias(); // refrescar
        } catch (err) {
          alert("No se pudo eliminar la categoría.");
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='4'>Error cargando categorías.</td></tr>";
  }
}

// -----------------------------
// BOTÓN MOSTRAR FORMULARIO
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const btnAdd = document.getElementById("btn-add-categoria");
  const form = document.getElementById("cat-form");
  const cancelBtn = document.getElementById("cat-cancel");
  const saveBtn = document.getElementById("cat-save");

  btnAdd.addEventListener("click", () => {
    form.style.display = "block";
  });

  cancelBtn.addEventListener("click", () => {
    form.style.display = "none";
  });

  saveBtn.addEventListener("click", createCategoria);
});

// -----------------------------
// CREAR CATEGORÍA
// -----------------------------
async function createCategoria() {
  const jwt = localStorage.getItem("jwt");

  const data = {
    NombreCategoria: document.getElementById("cat-nombre").value,
    Descripcion: document.getElementById("cat-desc").value,
    Estado: document.getElementById("cat-estado").value === "true"
  };

  try {
    const res = await fetch(`${STRAPI_URL}/api/categorias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`
      },
      body: JSON.stringify({ data })
    });

    if (!res.ok) throw new Error("Error al crear categoría");

    alert("Categoría creada correctamente");

    document.getElementById("cat-form").style.display = "none";
    loadCategorias();

  } catch (err) {
    alert("No se pudo crear la categoría.");
  }
}


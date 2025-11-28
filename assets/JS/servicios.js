let servicios = []; // lista cargada del backend

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

  const form = document.getElementById("form-servicio");
  const btnAdd = document.getElementById("btn-agregar");
  const cancelBtn = document.getElementById("cancel-form");

  // Botón agregar servicio
  btnAdd.addEventListener("click", () => {
    form.reset();
    btnAdd.style.display = "none";
    form.style.display = "block";
    delete form.dataset.editId;
  });

  // Cancelar
  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.style.display = "none";
    btnAdd.style.display = "block";
    delete form.dataset.editId;
  });

  // Guardar servicio
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const jwt = localStorage.getItem("jwt");
    const editId = form.dataset.editId;

    const data = {
      Titulo: document.getElementById("titulo").value,
      Descripcion: document.getElementById("descripcion").value,
      Precio: parseFloat(document.getElementById("precio").value),
      Cupos_Disponibles: parseInt(document.getElementById("cupos").value),
      Fecha_Hora: document.getElementById("fecha-hora").value,
      Duracion: document.getElementById("duracion").value,
      Estado: document.getElementById("estado").value === "true",
      //Imagen: document.getElementById("imagen").value || null
    };

    try {
      const url = editId
        ? `${STRAPI_URL}/api/servicios/${editId}`
        : `${STRAPI_URL}/api/servicios`;

      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ data })
      });

      if (!res.ok) throw new Error("Error guardando servicio");

      alert(editId ? "Servicio actualizado" : "Servicio agregado");

      form.reset();
      form.style.display = "none";
      btnAdd.style.display = "block";
      delete form.dataset.editId;

      loadServicios();
    } catch (err) {
      console.error(err);
      alert("No se pudo guardar el servicio.");
    }
  });

  loadServicios();
});


// =====================================================
// Cargar tabla de servicios
// =====================================================
async function loadServicios() {
  const jwt = localStorage.getItem("jwt");
  const tbody = document.querySelector("#servicios-table tbody");

  tbody.innerHTML = "<tr><td colspan='9'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${STRAPI_URL}/api/servicios?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });

    const data = await res.json();
    servicios = data.data || [];

    if (!servicios.length) {
      tbody.innerHTML = "<tr><td colspan='9'>No hay servicios.</td></tr>";
      return;
    }

    tbody.innerHTML = servicios
      .map(s => `
        <tr>
          <td>${s.Titulo}</td>
          <td>${s.Descripcion}</td>
          <td>${s.Precio}</td>
          <td>${s.Cupos_Disponibles}</td>
          <td>${s.Fecha_Hora}</td>
          <td>${s.Duracion}</td>
          <td>${s.Imagen ? `<img src="${s.Imagen}" width="50">` : ""}</td>
          <td>${s.Estado ? "Activo" : "Inactivo"}</td>
          <td>
            <button class="btn btn-outline" data-act="edit" data-id="${s.id}">Editar</button>
            <button class="btn btn-secondary" data-act="delete" data-id="${s.id}">Eliminar</button>
          </td>
        </tr>
      `)
      .join("");

    setupButtons();
  } catch (err) {
    console.error(err);
    tbody.innerHTML =
      "<tr><td colspan='9'>Error cargando servicios.</td></tr>";
  }
}


// =====================================================
// Setup de botones Editar / Eliminar
// =====================================================
function setupButtons() {
  const form = document.getElementById("form-servicio");
  const btnAdd = document.getElementById("btn-agregar");
  const jwt = localStorage.getItem("jwt");

  // EDITAR
  document.querySelectorAll("button[data-act='edit']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const s = servicios.find(x => x.id == id);
      if (!s) return;

      form.style.display = "block";
      btnAdd.style.display = "none";

      // Rellenar
      document.getElementById("titulo").value = s.Titulo;
      document.getElementById("descripcion").value = s.Descripcion;
      document.getElementById("precio").value = s.Precio;
      document.getElementById("cupos").value = s.Cupos_Disponibles;
      document.getElementById("fecha-hora").value = s.Fecha_Hora;
      document.getElementById("duracion").value = s.Duracion;
      document.getElementById("estado").value = s.Estado ? "true" : "false";
      document.getElementById("imagen").value = s.Imagen || "";

      form.dataset.editId = id;
    });
  });

  // ELIMINAR
  document.querySelectorAll("button[data-act='delete']").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("¿Eliminar servicio?")) return;

      try {
        const id = btn.dataset.id;
        const r = await fetch(`${STRAPI_URL}/api/servicios/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json"
          }
        });

        if (!r.ok) throw new Error("Error al eliminar");

        alert("Servicio eliminado");
        loadServicios();
      } catch (err) {
        console.error(err);
        alert("No se pudo eliminar el servicio.");
      }
    });
  });
}
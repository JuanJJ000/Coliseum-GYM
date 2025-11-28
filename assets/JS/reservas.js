// assets/JS/reservas.js

const form = document.getElementById("form-reserva");
const btnAdd = document.getElementById("btn-add-reserva");

document.addEventListener("DOMContentLoaded", async () => {
  if (typeof initHeader === "function") await initHeader();

  const user = await fetchCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "/Principal.html";
    return;
  }

  await loadSelects(); // cargar usuarios y servicios
  await loadReservas();

  btnAdd.addEventListener("click", () => {
    form.style.display = "block";
    btnAdd.style.display = "none";
  });

  document.getElementById("cancel-form").addEventListener("click", () => {
    form.reset();
    form.style.display = "none";
    btnAdd.style.display = "block";
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const jwt = localStorage.getItem("jwt");
  const editId = form.dataset.editId;

  const data = {
    Estado: document.getElementById("estado").value,
    Asistencia: document.getElementById("asistencia").checked,
    Observaciones: document.getElementById("observaciones").value || null,
    Usuario: document.getElementById("usuario").value || null,
    servicio: document.getElementById("servicio").value || null
  };

  try {
    const url = editId 
      ? `${STRAPI_URL}/api/reservas/${editId}`
      : `${STRAPI_URL}/api/reservas`;
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
      body: JSON.stringify({ data })
    });

    if (!res.ok) throw new Error("Error guardando reserva");
    alert(editId ? "Reserva actualizada" : "Reserva agregada");

    form.reset();
    delete form.dataset.editId;
    form.style.display = "none";
    btnAdd.style.display = "block";
    loadReservas();
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar la reserva.");
  }
});

// Cargar usuarios
async function loadSelects() {
  const jwt = localStorage.getItem("jwt");

  try {
    // ---- Usuarios ----
    const usersRes = await fetch(`${STRAPI_URL}/api/users?fields=id,username,email`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const usersData = await usersRes.json();
    const usuarios = usersData || [];

    const usuarioSelect = document.getElementById("usuario");
    if (!usuarios.length) {
      usuarioSelect.innerHTML = `<option value="">-- No hay usuarios disponibles --</option>`;
    } else {
      usuarioSelect.innerHTML = `<option value="">-- Selecciona un usuario --</option>` +
        usuarios
          .map(u => `<option value="${u.id}">${u.username || u.email || "--Sin nombre--"}</option>`)
          .join("");
    }

    // ---- Servicios ----
    const serviciosRes = await fetch(`${STRAPI_URL}/api/servicios?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const serviciosData = await serviciosRes.json();
    const servicios = serviciosData.data || [];

    const servicioSelect = document.getElementById("servicio");
    if (!servicios.length) {
      servicioSelect.innerHTML = `<option value="">-- No hay servicios disponibles --</option>`;
    } else {
      servicioSelect.innerHTML = `<option value="">-- Selecciona un servicio --</option>` +
        servicios
          .filter(s => s?.Titulo)
          .map(s => `<option value="${s.id}">${s.Titulo}</option>`)
          .join("");
    }

  } catch (err) {
    console.error("Error cargando selects:", err);
    alert("No se pudieron cargar usuarios o servicios.");
  }
}



async function loadReservas() {
  const jwt = localStorage.getItem("jwt");
  const tbody = document.querySelector("#reservas-table tbody");
  tbody.innerHTML = "<tr><td colspan='6'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${STRAPI_URL}/api/reservas?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    const reservas = data.data || [];

    if (!reservas.length) {
      tbody.innerHTML = "<tr><td colspan='6'>No hay reservas.</td></tr>";
      return;
    }

    tbody.innerHTML = reservas.map(r => `
      <tr>
        <td>${r.Usuario?.username || r.Usuario?.email || ""}</td>
        <td>${r.servicio?.Titulo || ""}</td>
        <td>${r.Estado}</td>
        <td>${r.Asistencia ? "Sí" : "No"}</td>
        <td>${r.Observaciones || ""}</td>
        <td>
          <button class="btn btn-outline" data-id="${r.id}" data-act="edit">Editar</button>
          <button class="btn btn-secondary" data-id="${r.id}" data-act="delete">Eliminar</button>
        </td>
      </tr>
    `).join("");

    // Listeners botones
    document.querySelectorAll("button[data-act='edit']").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const reserva = reservas.find(r => r.id == id);
        if (!reserva) return;

        form.style.display = "block";
        btnAdd.style.display = "none";

        document.getElementById("usuario").value = reserva.Usuario?.id || "";
        document.getElementById("servicio").value = reserva.servicio?.id || "";
        document.getElementById("estado").value = reserva.Estado;
        document.getElementById("asistencia").checked = reserva.Asistencia;
        document.getElementById("observaciones").value = reserva.Observaciones || "";

        form.dataset.editId = id;
      });
    });

    document.querySelectorAll("button[data-act='delete']").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!confirm("¿Deseas eliminar esta reserva?")) return;
        try {
          const id = btn.dataset.id;
          const res = await fetch(`${STRAPI_URL}/api/reservas/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }
          });
          if (!res.ok) throw new Error("Error al eliminar reserva");
          alert("Reserva eliminada");
          loadReservas();
        } catch (err) {
          console.error(err);
          alert("No se pudo eliminar la reserva.");
        }
      });
    });

  } catch (err) {
    console.error(err);
    tbody.innerHTML = "<tr><td colspan='6'>Error cargando reservas.</td></tr>";
  }
}

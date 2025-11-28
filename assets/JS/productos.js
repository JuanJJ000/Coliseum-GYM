// assets/JS/productos.js

const form = document.getElementById("form-producto");
const btnAdd = document.getElementById("btn-add-producto");
document.querySelectorAll("button[data-act='delete']").forEach(btn => {
  btn.addEventListener("click", async () => {
    if (!confirm("¿Deseas eliminar este producto?")) return;

    const id = btn.dataset.id;
    const jwt = localStorage.getItem("jwt");

    try {
      const res = await fetch(`${STRAPI_URL}/api/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Error al eliminar el producto");
      alert("Producto eliminado");
      loadProductos(); // recargar tabla
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el producto.");
    }
  });
});




document.querySelectorAll("button[data-act='edit']").forEach(btn => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.id;
    const producto = productos.find(p => p.id == id); // productos es tu array cargado

    if (!producto) return;

    // Mostrar formulario
    document.getElementById("form-producto").style.display = "block";

    // Rellenar campos
    document.getElementById("nombre").value = producto.Nombre;
    document.getElementById("descripcion").value = producto.Descripcion;
    document.getElementById("precio").value = producto.Precio;
    document.getElementById("stock").value = producto.Stock;
    document.getElementById("categoria").value = producto.categoria?.id || "";
    document.getElementById("descuento").value = producto.descuento?.id || "";
    document.getElementById("estado").checked = producto.Estado;
    document.getElementById("imagen").value = producto.Imagen || "";

    // Cambiar comportamiento del formulario a "update"
    form.dataset.editId = id;
  });
});






form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const jwt = localStorage.getItem("jwt");
  const editId = form.dataset.editId; // si existe, estamos editando

  const data = {
    Nombre: document.getElementById("nombre").value,
    Descripcion: document.getElementById("descripcion").value,
    Precio: parseFloat(document.getElementById("precio").value),
    Stock: parseInt(document.getElementById("stock").value),
    Estado: document.getElementById("estado").checked,
    Imagen: document.getElementById("imagen").value || null,
    categoria: document.getElementById("categoria").value || null,
    descuento: document.getElementById("descuento").value || null
  };

  try {
    const url = editId 
      ? `${STRAPI_URL}/api/productos/${editId}` 
      : `${STRAPI_URL}/api/productos`;
    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { 
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ data })
    });

    if (!res.ok) throw new Error("Error guardando producto");
    alert(editId ? "Producto actualizado" : "Producto agregado");
    form.reset();
    delete form.dataset.editId; // limpiar modo edición
    form.style.display = "none";
    loadProductos(); // recargar tabla
  } catch (err) {
    console.error(err);
    alert("No se pudo guardar el producto.");
  }
});




document.addEventListener("DOMContentLoaded", async () => {
  if (typeof initHeader === "function") await initHeader();

  const user = await fetchCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para acceder a esta página.");
    window.location.href = "/Principal.html";
    return;
  }

  await loadSelects(); // Cargar categorías y descuentos
  await loadProductos();

  // Botón agregar producto
  const btnAdd = document.getElementById("btn-add-producto");
  const form = document.getElementById("form-producto");
  const cancelBtn = document.getElementById("cancel-form");

  btnAdd.addEventListener("click", () => {
    form.style.display = "block";
    btnAdd.style.display = "none";
  });

  cancelBtn.addEventListener("click", () => {
    form.reset();
    form.style.display = "none";
    btnAdd.style.display = "block";
  });

  // Submit del formulario
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const jwt = localStorage.getItem("jwt");

    const nuevoProducto = {
      data: {
        Nombre: document.getElementById("nombre").value,
        Descripcion: document.getElementById("descripcion").value,
        Precio: parseFloat(document.getElementById("precio").value),
        Stock: parseInt(document.getElementById("stock").value),
        Estado: document.getElementById("estado").checked,
        Imagen: document.getElementById("imagen").value || null,
        categoria: parseInt(document.getElementById("categoria").value),
        descuento: document.getElementById("descuento").value
          ? parseInt(document.getElementById("descuento").value)
          : null
      }
    };

    try {
      const res = await fetch(`${STRAPI_URL}/api/productos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nuevoProducto)
      });

      if (!res.ok) throw new Error("Error creando producto");

      alert("Producto creado correctamente");
      form.reset();
      form.style.display = "none";
      btnAdd.style.display = "block";

      await loadProductos(); // refrescar tabla
    } catch (err) {
      console.error(err);
      alert("No se pudo crear el producto");
    }
  });
});

// Cargar selects de categorías y descuentos
async function loadSelects() {
  const jwt = localStorage.getItem("jwt");

  try {
    // Categorías
    const catRes = await fetch(`${STRAPI_URL}/api/categorias?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const catData = await catRes.json();
    const categorias = catData.data || [];
    const catSelect = document.getElementById("categoria");
    catSelect.innerHTML = categorias
      .map(c => `<option value="${c.id}">${c.NombreCategoria || ""}</option>`)
      .join("");

    // Descuentos
    const descRes = await fetch(`${STRAPI_URL}/api/descuentos?populate=*`, {
        headers: { Authorization: `Bearer ${jwt}` }
    });
    const descData = await descRes.json();
    const descuentos = descData.data || [];
    const descSelect = document.getElementById("descuento");

    // Agregar opción "Ninguno" + mapear correctamente Titulo
    descSelect.innerHTML =
        `<option value="">-- Ninguno --</option>` +
        descuentos
            .map(d => `<option value="${d.id}">${d.Titulo || ""}</option>`)
            .join("");


  } catch (err) {
    console.error("Error cargando selects:", err);
    alert("No se pudieron cargar categorías o descuentos.");
  }
}


// Cargar tabla de productos
async function loadProductos() {
  const jwt = localStorage.getItem("jwt");
  const tbody = document.querySelector("#productos-table tbody");
  tbody.innerHTML = "<tr><td colspan='9'>Cargando...</td></tr>";

  try {
    const res = await fetch(`${STRAPI_URL}/api/productos?populate=*`, {
      headers: { Authorization: `Bearer ${jwt}` }
    });
    const data = await res.json();
    const productos = data.data || [];

    //console.log("Producto crudo:", productos);

    if (!productos.length) {
      tbody.innerHTML = "<tr><td colspan='9'>No hay productos.</td></tr>";
      return;
    }

    tbody.innerHTML = productos
      .map(p => {
        // accesando directamente los campos planos y relaciones one-way
        return `
        <tr>
          <td>${p.Nombre || ""}</td>
          <td>${p.Descripcion || ""}</td>
          <td>${p.Precio || 0}</td>
          <td>${p.Stock || 0}</td>
          <td>${p.categoria?.NombreCategoria || ""}</td>
          <td>${p.descuento?.Titulo || ""}</td>
          <td>${p.Estado ? "Activo" : "Inactivo"}</td>
          <td>${p.Imagen ? `<img src="${p.Imagen}" width="50">` : ""}</td>
          <td>
            <button class="btn btn-outline" data-id="${p.id}" data-act="edit">Editar</button>
            <button class="btn btn-secondary" data-id="${p.id}" data-act="delete">Eliminar</button>
          </td>
        </tr>
        `;
      })
      .join("");

    // Listeners de botones
    document.querySelectorAll("button[data-act='edit']").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const producto = productos.find(p => p.id == id);
            if (!producto) return;

            form.style.display = "block";
            btnAdd.style.display = "none";

            // Rellenar formulario
            document.getElementById("nombre").value = producto.Nombre;
            document.getElementById("descripcion").value = producto.Descripcion;
            document.getElementById("precio").value = producto.Precio;
            document.getElementById("stock").value = producto.Stock;
            document.getElementById("categoria").value = producto.categoria?.id || "";
            document.getElementById("descuento").value = producto.descuento?.id || "";
            document.getElementById("estado").checked = producto.Estado;
            document.getElementById("imagen").value = producto.Imagen || "";

            form.dataset.editId = id; // activar modo edición
        });
        });


    document.querySelectorAll("button[data-act='delete']").forEach(btn => {

        btn.addEventListener("click", async () => {
            if (!confirm("Eliminar producto?")) return;
            try {
            const id = btn.dataset.id;
            const r = await fetch(`${STRAPI_URL}/api/productos/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }
            });
            if (!r.ok) throw new Error("Error al eliminar");
            alert("Producto eliminado");
            loadProductos();
            } catch (err) {
            console.error(err);
            alert("No se pudo eliminar el producto.");
            }
        });
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
    tbody.innerHTML = "<tr><td colspan='9'>Error cargando productos.</td></tr>";
  }
}

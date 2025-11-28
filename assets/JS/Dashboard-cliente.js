// assets/JS/dashboard-cliente.js
document.addEventListener("DOMContentLoaded", async () => {
  // render header dinámico
  if (typeof initHeader === "function") await initHeader();

  // validar sesión
  const user = await fetchCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para acceder al Dashboard de cliente.");
    window.location.href = "/Principal.html";
    return;
  }

  // verificar rol (opcional, si hay roles)
  if (user.role && user.role !== "cliente") {
    alert("No tienes permisos para acceder a esta sección.");
    window.location.href = "/dashboard.html";
    return;
  }

  console.log("Cliente logueado:", user.username || user.email);

  // mensaje de bienvenida
  const contentSection = document.querySelector(".dashboard-content");
  if (contentSection) {
    contentSection.innerHTML = `
      <h1>Bienvenido, ${user.username || user.email}</h1>
      <p>Desde aquí puedes explorar nuestros productos y servicios, gestionar tus reservas y consultar tus reportes.</p>
    `;
  }
});

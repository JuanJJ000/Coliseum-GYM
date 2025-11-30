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

  const esAdmin = esAdminSimple(user);
  if (esAdmin) {
   alert("Este Dashboard es solo para clientes. Serás redirigido al Dashboard de administrador.");
   window.location.href = "Public/Dashboard.html";
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

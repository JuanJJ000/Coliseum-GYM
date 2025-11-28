// assets/JS/Dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  // render header dinámico
  if (typeof initHeader === "function") await initHeader();

  // validar sesión
  const user = await fetchCurrentUser();
  if (!user) {
    alert("Debes iniciar sesión para acceder al Dashboard.");
    window.location.href = "/Principal.html";
    return;
  }

  console.log("Usuario logueado:", user.username || user.email);
});

const contenedor = document.querySelector('.Contenedor');
const btnSesion = document.getElementById('Btn-Sesion');
const btnRegistro = document.getElementById('Btn-Registro');

btnSesion.addEventListener('click', () => {
    contenedor.classList.remove('toggle');
});

btnRegistro.addEventListener('click', () => {
    contenedor.classList.add('toggle');
});

// Sign Up = Registro
// Sign In = Sesion

const STRAPI_URL = "http://localhost:1337/api";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector("form.Inicio-de-Sesion");
  const registerForm = document.querySelector("form.Registrarse");

  if (loginForm) {
    loginForm.addEventListener("submit", onLoginSubmit);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", onRegisterSubmit);
  }
});

async function onLoginSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value.trim();

  if (!email || !password) {
    alert("Por favor, ingresa tu correo y contraseña.");
    return;
  }

  try {
    const res = await fetch(`${STRAPI_URL}/auth/local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        identifier: email,
        password: password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        data?.error?.message ||
        data?.message?.[0]?.messages?.[0]?.message ||
        "Error al iniciar sesión.";
      alert(msg);
      return;
    }

    // Guardar token y usuario (opcional)
    localStorage.setItem("jwt", data.jwt);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirige después de login
    window.location.href = "/Principal.html";
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al conectar con el servidor.");
  }
}

async function onRegisterSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const username = form.querySelector('input[name="username"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();
  const password = form.querySelector('input[name="password"]').value.trim();

  if (!username || !email || !password) {
    alert("Por favor, completa todos los campos.");
    return;
  }

  try {
    const res = await fetch(`${STRAPI_URL}/auth/local/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        data?.error?.message ||
        data?.message?.[0]?.messages?.[0]?.message ||
        "Error al registrarse.";
      alert(msg);
      return;
    }

    // Guardar token y usuario (opcional)
    localStorage.setItem("jwt", data.jwt);
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirige después de registro
    window.location.href = "/Principal.html";
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error al conectar con el servidor.");
  }
}


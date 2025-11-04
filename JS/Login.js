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
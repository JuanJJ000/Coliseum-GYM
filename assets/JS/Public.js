async function VerProductos() {
  const contenedor=document.getElementById("data-display");  
  contenedor.innerHTML= '';
  
  try {
    const response=await fetch("http://localhost:1337/api/productos?populate=*");
    if (!response.ok) throw new Error(`Error al cargar productos en el publico`);

    const data = await response.json();
    const productos = data.data || data;

    productos.forEach(item => {

      const producto = item.attributes ? item.attributes : item;

      const ProdDiv = document.createElement("div");
    //   ProdDiv.classList.add("products-grid");

      ProdDiv.innerHTML=`

        <article class="card product">
            <div class="thumb" style="background:url('${producto.ImagenURL}') center/cover no-repeat"></div>

            <div class="card-body">
                <h3>${producto.Nombre}</h3>
                <p class="muted">${producto.Descripcion}</p>
                <div class="price">$${producto.Precio}</div>
                <button class="btn btn-secondary" type="button">Agregar</button>
            </div>
        </article>
      `;

      contenedor.appendChild(ProdDiv);
      
    });

    
  } catch (error) {
    console.log(`Error al cargar productos en publico `, error);
    
  }
  
}

VerProductos();
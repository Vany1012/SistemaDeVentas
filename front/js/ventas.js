//Función para crear productos para el boton btn-agregar-producto
const contenedorProductos = document.getElementById("productos-vendidos");
const btnAgregarProducto = document.getElementById("btn-agregar-producto");

btnAgregarProducto.addEventListener("click", () => {

  const productoDiv = document.createElement("div");
  productoDiv.classList.add("producto-card");

  productoDiv.innerHTML = `
    <input type="text" class="id-producto" placeholder="ID Producto">
    <input type="text" class="producto-nombre" placeholder="Nombre del producto">
    <input type="number" class="producto-cantidad" placeholder="Cantidad" min="1">
    <input type="number" class="producto-precio" placeholder="Precio unitario" min="0">
  `;

  contenedorProductos.appendChild(productoDiv);
});
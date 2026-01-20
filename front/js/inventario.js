
const API_URL = 'http://localhost:3000/api'; 
const token = localStorage.getItem("token");
const tbody = document.querySelector("table-container");

// BLOQUEO DE SEGURIDAD
// Si no hay token O el rol no es admin, lo sacamos de la página
if (!token || role !== 'admin') {
    alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    window.location.href = 'index.html';
}

// Función para cargar productos
const loadProducts = async () => {
  try {
    const res = await fetch(`${API_URL}/inventario/verInventario`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Token para el middleware 'protect'
      }
    });

    // Verificamos si la respuesta es correcta
    if (!res.ok) {
        throw new Error("Error al obtener los datos");
    }

    const products = await res.json();
    console.log(products);

    tbody.innerHTML = "";//Limpiar la tabla

    // 3. Iterar y crear filas
    products.forEach(product => {
      const tr = document.createElement("tr");

      //visual para el campo booleano
      const estadoTexto = product.activo ? 'Activo' : 'Inactivo';
      const estadoColor = product.activo ? 'green' : 'red';

      tr.innerHTML = `
        <td>${product.idProducto}</td>
        <td>${product.nombre}</td>
        <td>$${product.precio}</td>
        <td>${product.stock}</td>
        <td>${product.categoria}</td>
        <td style="color: ${estadoColor}; font-weight: bold;">${estadoTexto}</td>
        <td>
            <div id="btn">
                <button class="btn-editar">Editar</button>
                <button class="btn-eliminar">Eliminar</button>
            </div>
        </td>
      `;
      
      tbody.appendChild(tr);
    });

  } catch (error) {
    console.error("Error cargando inventario:", error);
    alert("No se pudo cargar el inventario. Revisa tu conexión o sesión.");
  }
};

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
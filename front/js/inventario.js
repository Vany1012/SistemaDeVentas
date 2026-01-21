
const API_URL = 'http://localhost:3000/api'; 
const token = localStorage.getItem("token");
const userData = JSON.parse(localStorage.getItem('userData'));

const tbody = document.querySelector("tbody");

// Función para eliminar producto
const eliminarProducto = async (id) => {
    // Confirmación de seguridad
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar el producto con ID: ${id}?`);
    if (!confirmar) return;

    try {
        
        const res = await fetch(`${API_URL}/inventario/eliminarProducto?idProducto=${id}`, {
            method: "PATCH", // Desactiva el producto
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || data.massage || "Error al eliminar");
        }

        alert("Producto eliminado correctamente");
        loadProducts(); // Recargar tabla actualizada

    } catch (error) {
        console.error("Error:", error);
        alert(error.message);
    }
};


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

    // Verificar si hay productos
    if (!products || products.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px;">
                No hay productos en el inventario
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    //Iterar y crear filas
    products.forEach(product => {
      const tr = document.createElement("tr");

      //vista para el campo booleano
      const estadoTexto = product.activo ? 'Activo' : 'Inactivo';
      const estadoColor = product.activo ? 'green' : 'red';


      //Ocultar/Mostrar botones
      let accionesAdmin = '';
      
      // Se muestran los botones si el usuario es 'admin'
      if (userData.role === 'admin') {
          accionesAdmin = `
            <div id="btn">
                <a href="editarProducto.html?id=${product.idProducto}" class="btn-editar" style="margin-right: 5px;">Editar</a>
                <button class="btn-eliminar" onclick="eliminarProducto('${product.idProducto}')">Eliminar</button>
            </div>
          `;
      } else {
          // Si no es admin
          accionesAdmin = `<span style="color: gray;">Sin permisos</span>`;
      }

      tr.innerHTML = `
        <td>${product.idProducto}</td>
        <td>${product.nombre}</td>
        <td>$${product.precio}</td>
        <td>${product.stock}</td>
        <td>${product.categoria}</td>
        <td style="color: ${estadoColor}; font-weight: bold;">${estadoTexto}</td>
        <td>
          ${accionesAdmin}
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
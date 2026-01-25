const API_URL = 'http://localhost:3000/api'; 
const token = localStorage.getItem("token");
const userData = JSON.parse(localStorage.getItem('userData'));

const tbody = document.querySelector("tbody");
const generalAlert = document.querySelector('#general-alert');
//Ocultar boton de agregar producto
document.addEventListener("DOMContentLoaded", () => {
    const btnAgregar = document.querySelector('.btn-agregar');
    if (userData.role !== 'admin' && btnAgregar) {
        btnAgregar.parentElement.style.display = 'none';
    }
    loadProducts();
});

//mensajes
const mostrarMensajeFila = (idProducto, mensaje, color) => {
    const celdaMensaje = document.getElementById(`msg-${idProducto}`);
    if (celdaMensaje) {
        celdaMensaje.textContent = mensaje;
        celdaMensaje.style.color = color;
        celdaMensaje.style.fontWeight = "bold";
    }
};

// Función para eliminar producto
const eliminarProducto = async (id) => {
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

        mostrarMensajeFila(id, "Producto eliminado", "red");
        setTimeout(() => {generalAlert.textContent = '';loadProducts();}, 1500);

    } catch (error) {
        console.error("Error:", error);
        mostrarMensajeFila(id, error.message, "red");
        setTimeout(() => {generalAlert.textContent = '';loadProducts();}, 5000);
    }
};

// Función para Editar --- Aporte IMPORTANTE para redirigir a ventana editarProducto
const editarProducto = (idProducto) => {
    // Redirigir a la página de edición CON el ID en la URL
    window.location.href = `editarProducto.html?id=${idProducto}`;
};

// Función para activar producto
const activarProducto = async (id) => {
    
    try {
        const res = await fetch(`${API_URL}/inventario/activarProducto?idProducto=${id}`, {
            method: "PATCH", 
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Error al activar");
        }

        mostrarMensajeFila(id, "Producto activado correctamente","green");
        setTimeout(() => {generalAlert.textContent = '';loadProducts();}, 1500);

    } catch (error) {
        console.error("Error:", error);
        mostrarMensajeFila(id, error.message,"red");
        setTimeout(() => {generalAlert.textContent = '';loadProducts();}, 5000);
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
            <td colspan="8" style="text-align: center; padding: 20px;">
                No hay productos en el inventario
            </td>
        `;
        tbody.appendChild(tr);
        return;
    }

    //Iterar y crear filas
    products.forEach(product => {
        const tr = document.createElement("tr");

        const estadoTexto = product.activo ? 'Activo' : 'Inactivo';
        const estadoColor = product.activo ? 'green' : 'red';

      //Lógica de botones
        let accionesAdmin = '';
      
        if (userData.role === 'admin') {
            if (product.activo) {
                // Producto ACTIVO
                    accionesAdmin = `
                    <div id="btn">
                        <a href="editarProducto.html?id=${product.idProducto}" class="btn-editar" style="margin-right: 5px;">Editar</a>
                        <button class="btn-eliminar" onclick="eliminarProducto('${product.idProducto}')">Eliminar</button>
                    </div>
                `;
            } else {
                //Producto INACTIVO
                accionesAdmin = `
                    <div id="btn">
                        <button class="btn-activar" onclick="activarProducto('${product.idProducto}')" style="background-color: #28a745; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px;">Activar</button>
                    </div>
                `;
            }
        } else {
            accionesAdmin = `<span style="color: gray;">Sin permisos</span>`;
        }

        tr.innerHTML = `
            <td>${product.idProducto}</td>
            <td>${product.nombre}</td>
            <td>$${product.precio}</td>
            <td>${product.stock}</td>
            <td>${product.categoria}</td>
            <td style="color: ${estadoColor}; font-weight: bold;">${estadoTexto}</td>
            <td>${accionesAdmin}</td>
            <td id="msg-${product.idProducto}" style="font-size: 0.9em;"></td>
        `;
        
        tbody.appendChild(tr);
});

        } catch (error) {
            console.error("Error cargando inventario:", error);
            generalAlert.textContent="No se pudo cargar el inventario. Revisa tu conexión o sesión.";
            generalAlert.style.color = "red";
        }
};

document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});
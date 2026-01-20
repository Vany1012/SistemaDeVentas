const API_URL = 'http://localhost:3000/api';
const contenedorProductos = document.getElementById("productos-vendidos");
const btnAgregarProducto = document.getElementById("btn-agregar-producto");
const userSession = JSON.parse(localStorage.userSession);

// Función para mostrar la fecha y el vendedor
document.addEventListener('DOMContentLoaded', () => {
  const hoy = new Date().toISOString().split('T')[0];
  const inputFecha = document.getElementById('fecha-venta');
  inputFecha.value = hoy;
  const nombreVendedor = userSession.vendedorName
  const inputVendedor = document.getElementById('vendedor');
  inputVendedor.value = nombreVendedor;
});

// Función para actualizar totales
function actualizarTotales() {
  const filas = document.querySelectorAll('.fila-producto');
  let cuentaProductos = 0;
  let sumaDinero = 0;
  filas.forEach(fila => {
    const select = fila.querySelector('.select-producto');
    const input = fila.querySelector('.input-cantidad');
    const cantidad = parseInt(input.value) || 0;
    const opcionSeleccionada = select.options[select.selectedIndex];
    const precio = parseFloat(opcionSeleccionada.dataset.price) || 0;

    if (select.value !== "") {
      cuentaProductos += cantidad;
      sumaDinero += (cantidad * precio);
    }
  });
  document.getElementById('total-productos').textContent = cuentaProductos;
  document.getElementById('total-venta').textContent = `$${sumaDinero.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
}

// Función para obtener inventario de la base de datos
async function obtenerInventario() {
  try {
    const response = await fetch(`${API_URL}/inventario/verInventario`, {
      headers: { 'Authorization': `Bearer ${userSession.token}` }
    });
    if (!response.ok) throw new Error('Error al obtener inventario');
    return await response.json();
  } catch (error) {
    console.error(error);
    alert("No se pudo cargar el inventario");
    return [];
  }
}

// Función para agregar productos
btnAgregarProducto.addEventListener('click', async () => {
  const inventario = await obtenerInventario();

  const divFila = document.createElement('div');
  divFila.className = 'fila-producto';

  const select = document.createElement('select');
  select.className = 'select-producto';
  select.innerHTML = '<option value="">Seleccione un producto...</option>';

  inventario.forEach(prod => {
    const option = document.createElement('option');
    option.value = prod.idProducto;
    option.dataset.stock = prod.stock;
    option.dataset.price = prod.precio;
    option.textContent = `${prod.idProducto} - ${prod.nombre}`;
    select.appendChild(option);
  });

  const inputCantidad = document.createElement('input');
  inputCantidad.type = 'number';
  inputCantidad.placeholder = '0';
  inputCantidad.min = '1';
  inputCantidad.className = 'input-cantidad';
  inputCantidad.disabled = true;

  const displayPrecio = document.createElement('span');
  displayPrecio.className = 'precio-unitario';
  displayPrecio.textContent = '$0.00';

  select.addEventListener('change', (e) => {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const stock = selectedOption.dataset.stock;
    const price = selectedOption.dataset.price;
    displayPrecio.textContent = `$${parseFloat(price).toFixed(2)}`;

    if (stock) {
      inputCantidad.disabled = false;
      inputCantidad.max = stock;
      inputCantidad.value = 1;
      inputCantidad.addEventListener('input', () => {
        if (inputCantidad.value < 0) inputCantidad.value = 0;
        actualizarTotales();
      });
    } else {
      inputCantidad.disabled = true;
      inputCantidad.value = "";
      displayPrecio.textContent = '$0.00';
    }
    actualizarTotales();
  });

  divFila.appendChild(select);
  divFila.appendChild(inputCantidad);
  divFila.appendChild(displayPrecio);
  contenedorProductos.appendChild(divFila);
});

// Función para enviar la venta al backend
document.querySelector("#btn-registrar-venta").addEventListener('click', async () => {
  const filas = document.querySelectorAll('.fila-producto');
  const productosVendidos = [];
  let acumuladorTotalProductos = 0;
  let acumuladorTotalDinero = 0;

  filas.forEach(fila => {
    const select = fila.querySelector('.select-producto');
    const inputCant = fila.querySelector('.input-cantidad');
    const id = select.value;
    const cantidad = parseInt(inputCant.value);
    const optionSel = select.options[select.selectedIndex];
    const nombre = optionSel.text.split(' - ')[1]?.split(' (')[0];
    const precioUnitario = parseFloat(optionSel.dataset.price);
    if (id && cantidad > 0) {
      productosVendidos.push({
        idProducto: id,
        nombre: nombre,
        cantidad: cantidad,
        precioUnitario: precioUnitario
      });
      acumuladorTotalProductos += cantidad;
      acumuladorTotalDinero += (cantidad * precioUnitario);
    }
  });

  if (productosVendidos.length === 0) {
    return alert("Debes agregar al menos un producto válido.");
  }
  const ventaData = {
    fecha: document.getElementById('fecha-venta').value,
    vendedor: document.getElementById('vendedor').value,
    productosVendidos: productosVendidos,
    totalProductos: acumuladorTotalProductos,
    total: acumuladorTotalDinero
  };

  console.log("Enviando al backend:", ventaData);

  try {
    const response = await fetch(`${API_URL}/ventas/registerVenta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userSession.token}`
      },
      body: JSON.stringify(ventaData)
    });

    if (response.ok) {
      const resultado = await response.json();
      alert("Venta registrada con éxito.");
      location.reload();
    } else {
      const errorData = await response.json();
      alert("Error del servidor: " + (errorData.message || "No se pudo registrar"));
    }
  } catch (error) {
    console.error("Error en la petición:", error);
  }
});
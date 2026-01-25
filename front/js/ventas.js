const API_URL = 'http://localhost:3000/api';
const contenedorProductos = document.getElementById("productos-vendidos");
const btnAgregarProducto = document.getElementById("btn-agregar-producto");
const inputFecha = document.getElementById('fecha-venta');
const inputVendedor = document.getElementById('vendedor');
const token = localStorage.getItem('token');
const userData = JSON.parse(localStorage.getItem('userData'));
const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
let inventarioGlobal = [];

document.addEventListener('DOMContentLoaded', async () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - (offset * 60 * 1000));
  const dia = localDate.getDate().toString().padStart(2, '0');
  const anio = localDate.getFullYear();
  const mesNombre = meses[localDate.getMonth()];

  const fechaFormateada = `${dia} - ${mesNombre} - ${anio}`;
  inputFecha.value = fechaFormateada;

  const nombreVendedor = userData ? userData.vendedorName : "Desconocido";
  inputVendedor.value = nombreVendedor;

  inventarioGlobal = await obtenerInventario();
  inventarioGlobal.sort((a, b) => a.nombre.localeCompare(b.nombre));
  llenarDatalist(inventarioGlobal);

  configurarMetodoPago();
});

function formatearMoneda(valor) {
  if (valor === "N/A" || valor === undefined || valor === null) return "N/A";
  const numero = typeof valor === 'string'
    ? parseFloat(valor.replace(/[^0-9.-]+/g, ""))
    : valor;

  return `$${numero.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mostrarMensaje(message, type = 'success') {
  const container = document.getElementById('notification-container');
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  container.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 500);
  }, 4000);
}

function generarPDF(datosTicket) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: [80, 160] });

  doc.setFontSize(14);
  doc.text("REGISTRO DE VENTA", 40, 10, { align: "center" });
  doc.setFontSize(8);
  doc.text(`Ticket: ${datosTicket.ventaId}`, 10, 18);
  doc.text(`Fecha: ${new Date(datosTicket.fecha).toLocaleString()}`, 10, 23);
  doc.text(`Vendedor: ${datosTicket.vendedor}`, 10, 28);
  doc.text("-".repeat(45), 10, 32);

  const filas = datosTicket.productosVendidos.map(p => [
    p.nombre,
    p.cantidad,
    formatearMoneda(p.cantidad * p.precioUnitario)
  ]);

  doc.autoTable({
    startY: 35,
    head: [['Producto', 'Cant.', 'Subt.']],
    body: filas,
    theme: 'plain',
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: { 2: { halign: 'right' } },
    margin: { left: 5, right: 5 }
  });

  const finalY = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text(`TOTAL: ${formatearMoneda(datosTicket.total)}`, 10, finalY);

  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text(`Método de Pago: ${datosTicket.metodoPago.toUpperCase()}`, 10, finalY + 6);
  doc.text(`Cambio: ${formatearMoneda(datosTicket.cambio)}`, 10, finalY + 10);

  doc.text("¡Gracias por su preferencia!", 40, finalY + 20, { align: "center" });

  doc.save(`Ticket_${datosTicket.ventaId}.pdf`);
}

function configurarMetodoPago() {
  const selectMetodo = document.getElementById('metodo-pago');
  const containerEfectivo = document.getElementById('container-efectivo');
  const inputRecibido = document.getElementById('monto-recibido');

  selectMetodo.addEventListener('change', () => {
    if (selectMetodo.value === 'efectivo') {
      containerEfectivo.style.display = 'flex';
    } else {
      containerEfectivo.style.display = 'none';
      inputRecibido.value = '';
      actualizarCambio();
    }
  });

  inputRecibido.addEventListener('input', (e) => {
    if (e.target.value < 0) e.target.value = 0;
    actualizarCambio();
  });
}

function actualizarCambio() {
  const totalVenta = parseFloat(document.getElementById('total-venta').textContent.replace('$', '').replace(',', '')) || 0;
  const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
  const metodoPago = document.getElementById('metodo-pago').value;

  if (metodoPago === 'efectivo') {
    const cambio = montoRecibido - totalVenta;
    const spanCambio = document.getElementById('valor-cambio');

    if (cambio >= 0) {
      spanCambio.textContent = `$${cambio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
      spanCambio.style.color = '#1b263b';
    } else {
      spanCambio.textContent = "Falta dinero";
      spanCambio.style.color = 'red';
    }
  }
}

function llenarDatalist(inventario) {
  const datalist = document.getElementById('lista-inventario');
  datalist.innerHTML = '';
  inventario.forEach(prod => {
    const option = document.createElement('option');
    option.value = prod.nombre;
    datalist.appendChild(option);
  });
}

function actualizarTotales() {
  const filas = document.querySelectorAll('.fila-producto');
  let cuentaProductos = 0;
  let sumaDinero = 0;

  filas.forEach(fila => {
    const inputNombre = fila.querySelector('.input-producto-search');
    const inputCant = fila.querySelector('.input-cantidad');

    let cantidad = parseInt(inputCant.value) || 0;
    if (cantidad < 0) cantidad = 0;

    const productoEncontrado = inventarioGlobal.find(p => p.nombre === inputNombre.value);

    if (productoEncontrado) {
      const precio = parseFloat(productoEncontrado.precio) || 0;
      cuentaProductos += cantidad;
      sumaDinero += (cantidad * precio);
    }
  });

  document.getElementById('total-productos').textContent = cuentaProductos;
  document.getElementById('total-venta').textContent = `$${sumaDinero.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;

  actualizarCambio();
}

async function obtenerInventario() {
  try {
    const response = await fetch(`${API_URL}/inventario/verInventario`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al obtener inventario');
    return await response.json();
  } catch (error) {
    mostrarMensaje("No se pudo cargar el inventario. Verifique su conexión.", "error")
    return [];
  }
}

btnAgregarProducto.addEventListener('click', () => {
  const divFila = document.createElement('div');
  divFila.className = 'fila-producto';

  const inputSearch = document.createElement('input');
  inputSearch.setAttribute('list', 'lista-inventario');
  inputSearch.className = 'input-producto-search';
  inputSearch.placeholder = 'Escribe para buscar...';

  const inputCantidad = document.createElement('input');
  inputCantidad.type = 'number';
  inputCantidad.placeholder = '0';
  inputCantidad.min = '1';
  inputCantidad.className = 'input-cantidad';
  inputCantidad.disabled = true;

  inputCantidad.addEventListener('keydown', (e) => {
    if (['-', '+', 'e', '.'].includes(e.key)) {
      e.preventDefault();
    }
  });

  inputCantidad.addEventListener('paste', (e) => {
    e.preventDefault();
    const textoPegado = (e.clipboardData || window.clipboardData).getData('text');
    // Solo permitir dígitos
    if (/^\d+$/.test(textoPegado)) {
      inputCantidad.value = textoPegado;
      actualizarTotales(); // Asegúrate de llamar a actualizar si pegan datos
    }
  });

  const displayPrecio = document.createElement('span');
  displayPrecio.className = 'precio-unitario';
  displayPrecio.textContent = '$0.00';

  const btnEliminar = document.createElement('button');
  btnEliminar.innerHTML = '×';
  btnEliminar.style.cssText = 'color: red; font-size: 1.5rem; background: none; border: none; cursor: pointer;';
  btnEliminar.onclick = () => {
    divFila.remove();
    actualizarTotales();
  };

  inputSearch.addEventListener('input', (e) => {
    const val = e.target.value;
    const producto = inventarioGlobal.find(p => p.nombre === val);

    if (producto) {
      displayPrecio.textContent = `$${parseFloat(producto.precio).toFixed(2)}`;
      inputCantidad.disabled = false;
      inputCantidad.max = producto.stock;

      if (inputCantidad.value === "" || inputCantidad.value == 0) {
        inputCantidad.value = 1;
      }

      if (parseInt(inputCantidad.value) > producto.stock) {
        inputCantidad.value = producto.stock;
      }
    } else {
      displayPrecio.textContent = '$0.00';
      inputCantidad.disabled = true;
      inputCantidad.value = '';
    }
    actualizarTotales();
  });

  inputCantidad.addEventListener('input', () => {
    const maxStock = parseInt(inputCantidad.max);
    let val = parseInt(inputCantidad.value);

    if (val < 0) {
      inputCantidad.value = 1;
      val = 1;
    }

    if (val > maxStock) {
      mostrarMensaje(`Stock insuficiente: Solo hay ${maxStock} unidades.`, "error");
      inputCantidad.value = maxStock;
    }

    actualizarTotales();
  });

  divFila.appendChild(inputSearch);
  divFila.appendChild(inputCantidad);
  divFila.appendChild(displayPrecio);
  divFila.appendChild(btnEliminar);
  contenedorProductos.appendChild(divFila);
});

document.querySelector("#btn-registrar-venta").addEventListener('click', async () => {
  const filas = document.querySelectorAll('.fila-producto');
  const productosVendidos = [];
  let hayErrores = false;

  filas.forEach((fila, index) => {
    if (hayErrores) return;

    const inputNombre = fila.querySelector('.input-producto-search');
    const inputCant = fila.querySelector('.input-cantidad');
    const nombreIngresado = inputNombre.value.trim();
    const cantidad = parseInt(inputCant.value) || 0;

    if (!nombreIngresado) return;

    const productoObj = inventarioGlobal.find(p => p.nombre === nombreIngresado);

    if (!productoObj) {
      mostrarMensaje(`Error en fila ${index + 1}: El producto "${nombreIngresado}" no existe.`, "error");
      hayErrores = true;
      inputNombre.style.borderColor = "red";
      return;
    } else {
      inputNombre.style.borderColor = "#cbd5e1";
    }


    if (cantidad <= 0) {
      mostrarMensaje(`Error en fila ${index + 1}: La cantidad debe ser mayor a 0.`, "error");
      hayErrores = true;
      return;
    }

    productosVendidos.push({
      idProducto: productoObj.idProducto,
      nombre: productoObj.nombre,
      cantidad: cantidad,
      precioUnitario: parseFloat(productoObj.precio)
    });
  });

  if (hayErrores) return;

  if (productosVendidos.length === 0) {
    return mostrarMensaje("Debes agregar al menos un producto válido.", "error");
  }

  const metodoPago = document.getElementById('metodo-pago').value;
  const totalVenta = parseFloat(document.getElementById('total-venta').textContent.replace('$', '').replace(',', ''));

  const ventaData = {
    vendedor: document.getElementById('vendedor').value,
    productosVendidos: productosVendidos,
    metodoPago: metodoPago
  };

  if (metodoPago === 'efectivo') {
    const monto = parseFloat(document.getElementById('monto-recibido').value) || 0;
    if (monto < totalVenta) {
      return mostrarMensaje("El monto recibido es menor al total.", "error");
    }
    ventaData.monto = monto;
  }

  try {
    const response = await fetch(`${API_URL}/ventas/registerVenta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(ventaData)
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const result = await response.json();

      if (response.ok) {
        mostrarMensaje("Venta registrada con éxito. Generando ticket...");
        generarPDF(result.TicketDeVenta);
        setTimeout(() => window.location.reload(), 3000);
      } else {
        mostrarMensaje(result.message || "Error al procesar la venta.", "error");
      }
    } else {
      throw new Error("Respuesta inválida del servidor");
    }

  } catch (error) {
    if (error.message === "Failed to fetch") {
      mostrarMensaje("Error de conexión: No se pudo contactar al servidor.", "error");
    } else {
      mostrarMensaje("Ocurrió un error inesperado al registrar la venta.", "error");
    }
  }
});
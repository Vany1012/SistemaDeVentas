
const API_URL = 'http://localhost:3000/api/vendedor';

// BLOQUEO DE SEGURIDAD
// Si no hay token OR el rol no es admin, lo sacamos de la página
const usuario = checkAdminAuth();
if (!usuario) {
    // alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    // window.location.href = 'index.html';
    // quitamos lo de arriba para no duplicar alertas de checkAdminAuth del authentification.js
}

console.log('Admin autentificado', usuario.vendedorName)

const userForm = document.querySelector('#registrarUsuario-form');
const vendedorName = document.querySelector('#vendedorName');
// const vendedorId = document.querySelector('#vendedorId');
const userPassword = document.querySelector('#password');
const userEmail = document.querySelector('#email');
const userRole = document.querySelector('#role');
const userActive = document.querySelector('#active');

async function estimarProximoVendedorId() {
    try {
        // Obtener la lista de vendedores para ver el último ID
        const response = await authFetch('/vendedors', {
            method: 'GET'
        });

        if (response.ok) {
            const vendedores = await response.json();
            
            // Encontrar el ID más alto
            let maxId = 0;
            vendedores.forEach(v => {
                if (v.vendedorId && v.vendedorId.startsWith('01')) {
                    const num = parseInt(v.vendedorId.substring(2));
                    if (num > maxId) maxId = num;
                }
            });
            
            // Calcular próximo ID
            const proximoId = `01${maxId + 1}`;
            return proximoId;
        }
    } catch (error) {
        console.error('Error al estimar próximo ID:', error);
    }
    
    // Si hay error, usar un placeholder
    return '01XXX';
};

// Llenamos el campo Id con placeholders
async function configurarCampoVendedorId() {
    if (!vendedorIdInput) return;
    
    // Configurar como campo informativo
    vendedorIdInput.placeholder = "Calculando próximo ID...";
    vendedorIdInput.readOnly = true;
    vendedorIdInput.style.backgroundColor = '#f9f9f9';
    
    // Obtener y mostrar el próximo ID estimado
    const proximoId = await estimarProximoVendedorId();
    vendedorIdInput.value = proximoId;
    
    // Agregar información visual
    const infoText = document.createElement('small');
    infoText.textContent = `Este será el ID asignado automáticamente`;
    infoText.style.cssText = `
        display: block;
        color: #666;
        margin-top: 5px;
        font-size: 12px;
    `;
    
    // Insertar el campo
    if (vendedorIdInput.parentNode) {
        const existingInfo = vendedorIdInput.parentNode.querySelector('small');
        if (existingInfo) existingInfo.remove();
        vendedorIdInput.parentNode.appendChild(infoText);
    }
}

const createNewUser = async () => {
  // Estructura de datos
  const payload = {
    vendedorName: vendedorName.value,
    // vendedorId: vendedorId.value,
    email: userEmail.value,
    password: userPassword.value,
    role: userRole.value,
    active: userActive.value
  };

  console.log('Enviando...',payload)

  // Validaciones de alta de usuario
  if (!vendedorName.value.trim()) {
        alert('El nombre del vendedor es requerido');
        return;
    }
    
    if (!userEmail.value.trim()) {
        alert('El email es requerido');
        return;
    }
    
    if (!userPassword.value.trim()) {
        alert('La contraseña es requerida');
        return;
    }
    

    // Confirmación del nuevo usuario
    const confirmar = confirm(
        `¿Crear nuevo usuario?\n\n` +
        `Nombre: ${vendedorName.value}\n` +
        `Email: ${userEmail.value}\n` +
        `Rol: ${userRole.value}\n` +
        `ID estimado: ${vendedorIdInput.value}\n\n` +
        `El ID será asignado automáticamente por el sistema.`
    );
    
    if (!confirmar) return;

  try {
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { 
        "Content-type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(data)
    if (res.ok) {
        alert("Usuario creado exitosamente");
        userForm.reset(); // Limpiar formulario
    } else {
        alert(`Error: ${data.message || 'No se pudo crear el usuario'}`);
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    alert("Error al conectar con el servidor");
  }
};

//
document.addEventListener('DOMContentLoaded', () => {
    configurarCampoVendedorId();
    if (userForm) {
      userForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await createNewUser();
      })
    }
});
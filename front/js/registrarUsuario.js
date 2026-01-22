
const API_URL = 'http://localhost:3000/api/vendedor';
//const userData = JSON.parse(localStorage.getItem('userData'));
//const token = localStorage.getItem("token");
const userData ="admin"
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJpZCI6IjY5NzI0YTQzY2I4OTVhOTE2Y2FiNDU4ZCIsImlhdCI6MTc2OTA5ODI1MiwiZXhwIjoxNzY5MTg0NjUyfQ.RRJCF-IfZz7EdV-de9Nd6IdkAzEZdM94whTBJr1aCwA"
/*
// BLOQUEO DE SEGURIDAD
// Si no hay token O el rol no es admin, lo sacamos de la página
if (!token || userData.role !== 'admin') {
    alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    window.location.href = 'index.html';
}*/

const userForm = document.querySelector('#registrarUsuario-form');
const vendedorName = document.querySelector('#vendedorName');
const vendedorId = document.querySelector('#vendedorId');
const userPassword = document.querySelector('#password');
const userEmail = document.querySelector('#email');
const userRole = document.querySelector('#role');
const userActive = document.querySelector('#active');

//Constantes para mensajes de Error
const passAlert = document.querySelector('#password-alert');
const emailAlert = document.querySelector('#email-alert');
const generalAlert = document.querySelector('#general-alert');


// Bloqueamos el campo | El id se genera automaticamente
document.addEventListener('DOMContentLoaded', () => {
    if (vendedorId) {
        vendedorId.disabled = true; 
        vendedorId.value = "Autogenerado al guardar"; 
        vendedorId.style.backgroundColor = "#e9ecef";
        vendedorId.style.fontStyle = "italic";
    }
});

//limpiar mensajes
const limpiarMensajes = () => {
    passAlert.innerHTML = '';
    emailAlert.innerHTML = '';
    generalAlert.innerHTML = '';
    generalAlert.className = 'status-msg'; // Resetear clases
};

// Validaciones
const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const getPasswordRequirements = (password) => ({
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
});

const obtenerErroresContraseña = (password) => {
    const req = getPasswordRequirements(password);
    const err = [];
    if (!req.minLength) err.push('Mínimo 8 caracteres');
    if (!req.hasUpperCase) err.push('Al menos una mayúscula');
    if (!req.hasLowerCase) err.push('Al menos una minúscula');
    if (!req.hasNumber) err.push('Al menos un número');
    if (!req.hasSpecialChar) err.push('Al menos un carácter especial');
    return err;
};

// Implementamos el llamado al endpoint POST => Funcón principal
const createNewUser = async () => {
  
  // Verificación de seguridad antes de enviar
  if (!token) {
    generalAlert.textContent = "No hay sesión activa.";
    generalAlert.classList.add('error-text');
    return;
  }

    //Validar Email
  const emailValue = userEmail.value;
  const passwordValue = userPassword.value;
  let hayErrores = false;

  if (!validarEmail(emailValue)) {
      emailAlert.textContent = "Formato de email inválido (ejemplo@dominio.com)";
      emailAlert.classList.add('error-text');
      hayErrores = true;
  }

  //Validar Contraseña
  const erroresPassword = obtenerErroresContraseña(passwordValue);
  if (erroresPassword.length > 0) {
      // Creamos una lista HTML
      const listaHTML = `<ul class="password-errors-list">
                            ${erroresPassword.map(e => `<li>${e}</li>`).join('')}
                         </ul>`;
      passAlert.innerHTML = listaHTML;
      hayErrores = true;
  }

  if (hayErrores) return; // Si hubo errores locales, no enviamos nada al servidor

  // Creamos la estructura de datos
  const payload = {
    vendedorName: vendedorName.value,
    //vendedorId: vendedorId.value,
    email: userEmail.value,
    password: userPassword.value,
    role: userRole.value,
    active: userActive.value
  };

  console.log(payload)

  generalAlert.textContent = "Procesando registro...";
  generalAlert.style.color = "blue";
  
  try {
    // Hacemos el llamado al endpoint
    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { 
        "Content-type": "application/json",
        "Authorization": `Bearer ${token}` // Enviamos el token
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log(data)

    if (res.ok) {
        // Éxito al crear usuario
        generalAlert.textContent = "¡Usuario creado exitosamente!";
        generalAlert.className = 'success-text'; // Clase verde
        
        const idGenerado = data.vendedorId || (data.user && data.user.vendedorId) || data.vendedor?.vendedorId;

        if (idGenerado) {
             vendedorId.value = idGenerado; // Mostramos el ID real asignado
             generalAlert.textContent += `  | ID Asignado: ${idGenerado}`;
        }
        userForm.reset();
        
        // Opcional: Borrar mensaje de éxito después de 3 segundos
        //setTimeout(() => { generalAlert.textContent = ''; }, 10000);
    } else {
        // Devuelve errores detallados
        if (data.requisitos) {
            generalAlert.textContent = "Error de validación: " + data.requisitos.join(', ');
    
        } else {
          generalAlert.textContent = `Error: ${data.message || 'No se pudo crear el usuario'}`;
          generalAlert.className = 'error-text'; // Clase roja
        }
    }

  } catch (error) {
    console.error("Error de conexión:", error);
    alert("Error al conectar con el servidor");
  }
};

if (userForm) {
  userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await createNewUser();
  });

  userPassword.addEventListener('input', () => { passAlert.innerHTML = ''; });
  userEmail.addEventListener('input', () => { emailAlert.innerHTML = ''; });

}
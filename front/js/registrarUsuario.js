
const API_URL = 'http://localhost:3000/api/vendedor';
const userData = JSON.parse(localStorage.getItem('userData'));
const token = localStorage.getItem("token");

const userForm = document.querySelector('#registrarUsuario-form');
const vendedorName = document.querySelector('#vendedorName');
//const vendedorId = document.querySelector('#vendedorId');
const userPassword = document.querySelector('#password');
const userEmail = document.querySelector('#email');
const userRole = document.querySelector('#role');
const userActive = document.querySelector('#active');

//Constantes para mensajes de Error
const passAlert = document.querySelector('#password-alert');
const emailAlert = document.querySelector('#email-alert');
const generalAlert = document.querySelector('#general-alert');

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
      const listaHTML = `<ul class="password-errors-list" style="color: red;">
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
          
             //generalAlert.textContent += `  | ID Asignado: ${idGenerado}`;
             generalAlert.innerHTML = `
                <div style="text-align: left;" >
                    <h3 style="margin: 0 0 10px 0;">¡Usuario registrado exitosamente!</h3>
                    <strong>ID Vendedor:</strong> ${idGenerado}<br>
                    <strong>Nombre:</strong> ${payload.vendedorName}<br>
                    <strong>Email:</strong> ${payload.email}<br>
                    <strong>Rol:</strong> ${payload.role}<br>
                    <strong>Estado:</strong> ${payload.active === 'true' || payload.active === true ? 'Activo' : 'Inactivo'}
                </div>`;
                generalAlert.style.color = "#155724";            
                generalAlert.style.backgroundColor = "#d4edda";  
                generalAlert.style.borderColor = "#c3e6cb";      
                generalAlert.style.borderWidth = "1px";
                generalAlert.style.borderStyle = "solid";
                generalAlert.style.padding = "15px";
                generalAlert.style.borderRadius = "5px";
                generalAlert.style.marginTop = "15px";
        }
        userForm.reset();
        
        // Opcional: Borrar mensaje de éxito después de 5 segundos
        setTimeout(() => { generalAlert.textContent = '';generalAlert.removeAttribute('style'); }, 5000);
    } else {
        // Error
        if (data.requisitos) {
            
            generalAlert.textContent = "Error de validación: " + data.requisitos.join(', ');
    
    
        } else {
          // ERROR DEL SERVIDOR
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
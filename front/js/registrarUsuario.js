
const API_URL = 'http://localhost:3000/api/vendedor';

// BLOQUEO DE SEGURIDAD
// Si no hay token OR el rol no es admin, lo sacamos de la página
const usuario = checkAdminAuth();
if (!usuario) {
    alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    window.location.href = 'index.html';
}

console.log('Admin autentificado', usuario.vendedorName)

const userForm = document.querySelector('#registrarUsuario-form');
const vendedorName = document.querySelector('#vendedorName');
// const vendedorId = document.querySelector('#vendedorId');
const userPassword = document.querySelector('#password');
const userEmail = document.querySelector('#email');
const userRole = document.querySelector('#role');
const userActive = document.querySelector('#active');

// Implementamos el llamado al endpoint POST
const createNewUser = async () => {
  
  // Verificación de seguridad antes de enviar
  if (!token) {
    alert("No hay token de sesión. Debes ser Admin para registrar.");
    return;
  }

  // Estructura de datos
  const payload = {
    vendedorName: vendedorName.value,
    // vendedorId: vendedorId.value,
    email: userEmail.value,
    password: userPassword.value,
    role: userRole.value,
    active: userActive.value
  };

  console.log(payload)

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
if (userForm) {
  userForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await createNewUser();
  });
}
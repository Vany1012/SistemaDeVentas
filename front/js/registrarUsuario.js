

const API_URL = 'http://localhost:3000/api/vendedor';
const role = localStorage.getItem("role");
const token = localStorage.getItem("token");
// BLOQUEO DE SEGURIDAD
// Si no hay token O el rol no es admin, lo sacamos de la página
if (!token || role !== 'admin') {
    alert("Acceso denegado: Solo los administradores pueden ver esta página.");
    window.location.href = 'index.html';
}

const userForm = document.querySelector('#product-form');
const vendedorName = document.querySelector('#vendedorName');
const vendedorId = document.querySelector('#vendedorId');
const userPassword = document.querySelector('#password');
const userEmail = document.querySelector('#email');
const userRole = document.querySelector('#role');
const userActive = document.querySelector('#active');

// Implementamos el llamado al endpoint POST
const createNewUser = async () => {
  
  // Verificación de seguridad antes de enviar
  if (!token) {
    alert("No hay token de sesión. Debes ser admin para registrar.");
    return;
  }

  // Creamos la estructura de datos
  const payload = {
    vendedorName: vendedorName.value,
    vendedorId: vendedorId.value,
    email: userEmail.value,
    password: userPassword.value,
    role: userRole.value,
    active: userActive.value
  };

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
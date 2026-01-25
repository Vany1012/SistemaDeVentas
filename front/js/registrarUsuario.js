const API_URL = 'http://localhost:3000/api';

// Inicializar la página con verificación de admin
function inicializarPagina() {
    // Verificar que solo admin pueda acceder
    const usuario = checkAdminAuth();
    if (!usuario) return;
    
    console.log('Admin autenticado:', usuario.vendedorName);
    
    // Configurar el formulario
    configurarFormulario();
    
    // Mostrar información del admin actual
    mostrarInfoAdmin(usuario);
}

// Mostrar información del administrador actual
function mostrarInfoAdmin(usuario) {
    const infoAdmin = document.createElement('div');
    infoAdmin.style.cssText = `
        background-color: #e8f4fd;
        border-left: 4px solid #2196F3;
        padding: 10px 15px;
        margin-bottom: 20px;
        border-radius: 5px;
        font-size: 14px;
    `;
    
    infoAdmin.innerHTML = `
        <strong>👤 Administrador actual:</strong> ${usuario.vendedorName} (${usuario.vendedorId || 'N/A'})<br>
        <small>Solo administradores pueden registrar nuevos usuarios</small>
    `;
    
    // Insertar al inicio del contenedor principal
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(infoAdmin, container.firstChild);
    }
}

// Función mejorada para validar email con mensajes específicos
function validarEmailConMensaje(email) {
    const emailValue = email.trim();
    
    // Verificar si está vacío
    if (!emailValue) {
        return {
            valido: false,
            mensaje: 'El email es requerido'
        };
    }
    
    // Verificar si tiene espacios
    if (/\s/.test(emailValue)) {
        return {
            valido: false,
            mensaje: 'El email no puede contener espacios'
        };
    }
    
    // Verificar estructura básica
    if (!emailValue.includes('@')) {
        return {
            valido: false,
            mensaje: 'El email debe contener el símbolo @'
        };
    }
    
    // Dividir en usuario y dominio
    const partes = emailValue.split('@');
    if (partes.length !== 2) {
        return {
            valido: false,
            mensaje: 'Formato de email inválido. Debe tener un solo @'
        };
    }
    
    const [usuario, dominio] = partes;
    
    // Verificar usuario
    if (!usuario || usuario.length === 0) {
        return {
            valido: false,
            mensaje: 'Debe haber texto antes del @ (ej: usuario@dominio.com)'
        };
    }
    
    // Verificar dominio
    if (!dominio || dominio.length === 0) {
        return {
            valido: false,
            mensaje: 'Debe haber texto después del @ (ej: usuario@dominio.com)'
        };
    }
    
    // Verificar que el dominio tenga punto
    if (!dominio.includes('.')) {
        return {
            valido: false,
            mensaje: 'El dominio debe contener un punto (ej: dominio.com)'
        };
    }
    
    // Verificar que haya texto después del último punto
    const extension = dominio.split('.').pop();
    if (!extension || extension.length < 2) {
        return {
            valido: false,
            mensaje: 'La extensión del dominio es muy corta (ej: .com, .mx, .org)'
        };
    }
    
    // Expresión regular completa para validación final
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(emailValue)) {
        return {
            valido: false,
            mensaje: 'Formato de email inválido. Ejemplo: usuario@dominio.com'
        };
    }
    
    // Si pasa todas las validaciones
    return {
        valido: true,
        mensaje: '✓ Email válido'
    };
}

// Configurar el formulario y sus eventos
function configurarFormulario() {
    const userForm = document.querySelector('#registrarUsuario-form');
    if (!userForm) return;
    
    const vendedorName = document.querySelector('#vendedorName');
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
        if (passAlert) {
            passAlert.innerHTML = '';
            passAlert.style.color = '';
            passAlert.classList.remove('error-text', 'success-text');
        }
        if (emailAlert) {
            emailAlert.innerHTML = '';
            emailAlert.style.color = '';
            emailAlert.classList.remove('error-text', 'success-text');
        }
        if (generalAlert) {
            generalAlert.innerHTML = '';
            generalAlert.className = 'status-msg';
            generalAlert.removeAttribute('style');
        }
    };
    
    // Función para mostrar mensaje en el emailAlert
    const mostrarMensajeEmail = (mensaje, esError = true) => {
        if (!emailAlert) return;
        
        emailAlert.innerHTML = mensaje;
        emailAlert.style.color = esError ? '#dc3545' : '#28a745';
        emailAlert.style.fontSize = '13px';
        emailAlert.style.marginTop = '5px';
        emailAlert.style.display = 'block';
        
        if (esError) {
            emailAlert.classList.add('error-text');
            emailAlert.classList.remove('success-text');
            // También aplicar estilo al input
            userEmail.style.borderColor = '#dc3545';
            userEmail.style.borderWidth = '2px';
        } else {
            emailAlert.classList.add('success-text');
            emailAlert.classList.remove('error-text');
            userEmail.style.borderColor = '#28a745';
            userEmail.style.borderWidth = '2px';
        }
    };
    
    // Función para mostrar mensaje en el passAlert
    const mostrarMensajePassword = (mensaje, esError = true) => {
        if (!passAlert) return;
        
        passAlert.innerHTML = mensaje;
        passAlert.style.color = esError ? '#dc3545' : '#28a745';
        passAlert.style.fontSize = '13px';
        passAlert.style.marginTop = '5px';
        passAlert.style.display = 'block';
        
        if (esError) {
            passAlert.classList.add('error-text');
            passAlert.classList.remove('success-text');
            userPassword.style.borderColor = '#dc3545';
            userPassword.style.borderWidth = '2px';
        } else {
            passAlert.classList.add('success-text');
            passAlert.classList.remove('error-text');
            userPassword.style.borderColor = '#28a745';
            userPassword.style.borderWidth = '2px';
        }
    };
    
    // Resetear estilos del input
    const resetearEstiloInput = (input) => {
        if (input) {
            input.style.borderColor = '';
            input.style.borderWidth = '';
        }
    };
    
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
    
    // Validar formulario completo
    const validarFormulario = () => {
        let hayErrores = false;
        
        // Validar campos requeridos
        if (!vendedorName.value.trim()) {
            mostrarErrorGeneral('El nombre del vendedor es requerido');
            hayErrores = true;
            return false;
        }
        
        // Validar email con la nueva función
        const resultadoEmail = validarEmailConMensaje(userEmail.value);
        if (!resultadoEmail.valido) {
            mostrarMensajeEmail(resultadoEmail.mensaje, true);
            hayErrores = true;
        }
        
        // Validar contraseña
        const erroresPassword = obtenerErroresContraseña(userPassword.value);
        if (erroresPassword.length > 0) {
            const listaHTML = `<ul style="margin: 5px 0; padding-left: 20px;">
                                ${erroresPassword.map(e => `<li>${e}</li>`).join('')}
                            </ul>`;
            mostrarMensajePassword(listaHTML, true);
            hayErrores = true;
        }
        
        // Validar rol
        if (!userRole.value) {
            mostrarErrorGeneral('Debe seleccionar un rol');
            hayErrores = true;
        }
        
        return !hayErrores;
    };
    
    // Mostrar error general
    const mostrarErrorGeneral = (mensaje) => {
        if (generalAlert) {
            generalAlert.textContent = mensaje;
            generalAlert.style.cssText = `
                color: #721c24;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                padding: 10px;
                border-radius: 5px;
                margin-top: 15px;
            `;
        }
    };
    
    // Mostrar éxito
    const mostrarExito = (mensaje) => {
        if (generalAlert) {
            generalAlert.innerHTML = mensaje;
            generalAlert.style.cssText = `
                color: #155724;
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                padding: 15px;
                border-radius: 5px;
                margin-top: 15px;
            `;
        }
    };
    
    // Validación en tiempo real para email
    const validarEmailEnTiempoReal = () => {
        const email = userEmail.value.trim();
        
        // Si está vacío, no mostrar mensaje
        if (!email) {
            mostrarMensajeEmail('', false);
            resetearEstiloInput(userEmail);
            return;
        }
        
        const resultado = validarEmailConMensaje(email);
        mostrarMensajeEmail(resultado.mensaje, !resultado.valido);
    };
    
    // Validación en tiempo real para contraseña
    const validarPasswordEnTiempoReal = () => {
        const password = userPassword.value;
        
        // Si está vacío, no mostrar mensaje
        if (!password) {
            mostrarMensajePassword('', false);
            resetearEstiloInput(userPassword);
            return;
        }
        
        const errores = obtenerErroresContraseña(password);
        if (errores.length === 0) {
            mostrarMensajePassword('✓ Contraseña válida', false);
        } else {
            const listaHTML = `<ul style="margin: 5px 0; padding-left: 20px;">
                                ${errores.map(e => `<li>${e}</li>`).join('')}
                            </ul>`;
            mostrarMensajePassword(listaHTML, true);
        }
    };
    
    // Implementamos el llamado al endpoint POST => Función principal
    const createNewUser = async () => {
        // Verificar que aún somos admin
        const usuario = checkAdminAuth();
        if (!usuario) return;
        
        // Validar formulario
        if (!validarFormulario()) return;
        
        // Preparar datos
        const payload = {
            vendedorName: vendedorName.value.trim(),
            email: userEmail.value.trim(),
            password: userPassword.value,
            role: userRole.value,
            active: userActive.value === 'true' || userActive.value === 'si' || userActive.value === '1'
        };
        
        console.log('Enviando payload:', payload);
        
        // Mostrar mensaje de procesamiento
        if (generalAlert) {
            generalAlert.textContent = "Procesando registro...";
            generalAlert.style.cssText = `
                color: #004085;
                background-color: #cce5ff;
                border: 1px solid #b8daff;
                padding: 10px;
                border-radius: 5px;
                margin-top: 15px;
            `;
        }
        
        try {
            // Usar authFetch para incluir el token automáticamente
            const response = await authFetch('/vendedor/register', {
                method: "POST",
                body: JSON.stringify(payload)
            });
            
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (response.ok) {
                // Éxito al crear usuario
                const idGenerado = data.vendedorId || (data.user && data.user.vendedorId) || (data.vendedor && data.vendedor.vendedorId);
                
                if(idGenerado){
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
                }userForm.reset();
                
                // Borrar mensaje de éxito después de 8 segundos
                setTimeout(() => {
                    if (generalAlert) {
                        generalAlert.innerHTML = '';
                        generalAlert.removeAttribute('style');
                    }
                }, 8000);
                
            } else {
                // Error del servidor
                let mensajeError = `Error: ${data.message || 'No se pudo crear el usuario'}`;
                
                if (data.requisitos) {
                    mensajeError = "Error de validación: " + data.requisitos.join(', ');
                } else if (data.error) {
                    mensajeError = data.error;
                }
                
                mostrarErrorGeneral(mensajeError);
            }
            
        } catch (error) {
            console.error("Error de conexión:", error);
            
            if (error.message === 'No autenticado.' || error.message === 'Sesión expirada') {
                mostrarErrorGeneral("Sesión expirada. Por favor, inicia sesión nuevamente.");
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } else {
                mostrarErrorGeneral("Error al conectar con el servidor. Verifica tu conexión.");
            }
        }
    };
    
    // Configurar eventos
    userForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        await createNewUser();
    });
    
    // Eventos para validación en tiempo real
    if (userEmail) {
        userEmail.addEventListener('input', () => {
            validarEmailEnTiempoReal();
        });
        
        userEmail.addEventListener('blur', () => {
            validarEmailEnTiempoReal();
        });
        
        userEmail.addEventListener('focus', () => {
            // Mostrar ejemplo cuando el campo recibe foco
            mostrarMensajeEmail('Ejemplo: usuario@dominio.com', false);
        });
    }
    
    if (userPassword) {
        userPassword.addEventListener('input', () => {
            validarPasswordEnTiempoReal();
        });
        
        userPassword.addEventListener('blur', () => {
            validarPasswordEnTiempoReal();
        });
        
        userPassword.addEventListener('focus', () => {
            mostrarMensajePassword('Requisitos: 8+ caracteres, mayúscula, minúscula, número, carácter especial', false);
        });
    }
    
    // Limpiar mensajes al hacer clic en cualquier campo
    const camposFormulario = [vendedorName, userEmail, userPassword, userRole, userActive];
    camposFormulario.forEach(campo => {
        if (campo) {
            campo.addEventListener('focus', () => {
                if (generalAlert) {
                    generalAlert.innerHTML = '';
                    generalAlert.removeAttribute('style');
                }
            });
        }
    });
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', inicializarPagina);
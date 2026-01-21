// Validaciones para registros de vendedor

// Validar formato de email
const validarEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validar contraseña segura
// Requisitos:
// - Mínimo 8 caracteres
// - Al menos una mayúscula
// - Al menos una minúscula
// - Al menos un número
// - Al menos un carácter especial (!@#$%^&*)
const validarContraseña = (password) => {
    const requirements = {
        minLength: password.length >= 8,
        hasUpperCase: /[A-Z]/.test(password),
        hasLowerCase: /[a-z]/.test(password),
        hasNumber: /\d/.test(password),
        hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };

    return requirements;
};

// Verificar si todas las validaciones de contraseña pasan
const esContraseñaSegura = (password) => {
    const requirements = validarContraseña(password);
    return Object.values(requirements).every(req => req === true);
};

// Obtener mensaje de error detallado para contraseña
const obtenerMensajeContraseña = (password) => {
    const requirements = validarContraseña(password);
    const errores = [];

    if (!requirements.minLength) {
        errores.push('Mínimo 8 caracteres');
    }
    if (!requirements.hasUpperCase) {
        errores.push('Al menos una mayúscula (A-Z)');
    }
    if (!requirements.hasLowerCase) {
        errores.push('Al menos una minúscula (a-z)');
    }
    if (!requirements.hasNumber) {
        errores.push('Al menos un número (0-9)');
    }
    if (!requirements.hasSpecialChar) {
        errores.push('Al menos un carácter especial (!@#$%^&*)');
    }

    return errores;
};

// Middleware de validación para registro
exports.validarRegistroVendedor = (req, res, next) => {
    const { vendedorName, vendedorId, email, password } = req.body;

    // Validar campos requeridos
    if (!vendedorName || !vendedorId || !email || !password) {
        return res.status(400).json({ 
            message: 'Todos los campos son requeridos' 
        });
    }

    // Validar formato de email
    if (!validarEmail(email)) {
        return res.status(400).json({ 
            message: 'Formato de email inválido. Ejemplo: usuario@dominio.com' 
        });
    }

    // Validar contraseña segura
    if (!esContraseñaSegura(password)) {
        const errores = obtenerMensajeContraseña(password);
        return res.status(400).json({ 
            message: 'Contraseña no cumple con los requisitos de seguridad',
            requisitos: errores
        });
    }

    next();
};

exports.validarEmail = validarEmail;
exports.esContraseñaSegura = esContraseñaSegura;
exports.obtenerMensajeContraseña = obtenerMensajeContraseña;
exports.validarContraseña = validarContraseña;

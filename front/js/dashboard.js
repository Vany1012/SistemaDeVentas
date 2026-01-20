document.addEventListener('DOMContentLoaded', () => {

    const user = checkAuth();
    if (!user) return;

    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('hamburgerLinks');

    menuBtn.addEventListener('click', () => {
        // Esto agrega o quita la clase 'active' al menú
        menu.classList.toggle('active');
        
        // Opcional: Cambiar el icono de hamburguesa a una X
        if(menu.classList.contains('active')) {
            menuBtn.classList.remove('fa-bars');
            menuBtn.classList.add('fa-times');
        } else {
            menuBtn.classList.add('fa-bars');
            menuBtn.classList.remove('fa-times');
        }
    });
});

function setupRoleBasedRedirects(user) {
    // Si no es admin, ocultar opciones de admin
    if (user.role !== 'admin') {
        // Ocultar "Registrar Usuario" del dashboard
        const registrarUsuarioLink = document.querySelector('a[href="registrarUsuario.html"]');
        if (registrarUsuarioLink) {
            registrarUsuarioLink.style.display = 'none';
        }
        
        // Ocultar del menú hamburguesa
        const menuLinks = document.querySelectorAll('#hamburgerLinks a');
        menuLinks.forEach(link => {
            if (link.getAttribute('href') === 'registrarUsuario.html') {
                link.style.display = 'none';
            }
            // Oculta "Editar Producto" si no es para admin
            if (link.getAttribute('href') === 'editarProducto.html' && user.role !== 'admin') {
                link.style.display = 'none';
            }
        });
    }
}
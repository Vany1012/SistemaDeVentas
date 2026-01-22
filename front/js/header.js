async function loadHeader() {
    try {
        const response = await fetch('../components/header.html');
        const html = await response.text();
        document.getElementById('header-container').innerHTML = html;

        // Una vez cargado, ejecutamos la lógica
        initHeaderLogic();
    } catch (error) {
        console.error("Error cargando el header:", error);
    }
}

function initHeaderLogic() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userNameElement = document.getElementById('user-role');
    const adminElements = document.querySelectorAll('.admin-exclusive');
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('hamburgerLinks');
    const logoutBtn = document.getElementById('logoutBtn');

    // Mostrar nombre de usuario
    if (userData && userNameElement) {
        userNameElement.textContent = `Bienvenido, ${userData.vendedorName}`;
    }

    // Control de permisos Admin
    if (userData && userData.role !== 'admin') {
        adminElements.forEach(el => el.remove());
    }

    // Ocultar link de la página actual
    const currentPage = window.location.pathname.split("/").pop() || "dashboard.html";
    const links = document.querySelectorAll('#hamburgerLinks a');
    links.forEach(link => {
        if (link.getAttribute('data-page') === currentPage) {
            link.classList.add('current-page');
        }
    });

    // Toggle Menú Hamburguesa
    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
        menuBtn.classList.toggle('fa-bars');
        menuBtn.classList.toggle('fa-times');
    });

    // Cerrar sesión
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = 'index.html';
    });
}

document.addEventListener('DOMContentLoaded', loadHeader);
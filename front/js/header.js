async function loadHeader() {
    try {
        const response = await fetch('../components/header.html');
        const html = await response.text();
        document.getElementById('header-container').innerHTML = html;
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
    const headerLogoutBtn = document.getElementById('headerLogoutBtn');
    const path = window.location.pathname;
    const currentPage = path.split("/").pop();

    if (currentPage === "dashboard.html" || currentPage === "") {
        document.body.classList.add('on-dashboard');
    }

    const menuLinks = document.querySelectorAll('#hamburgerLinks a');
    menuLinks.forEach(link => {
        // Obtenemos el nombre del archivo del atributo href o data-page
        const linkPage = link.getAttribute('href');
        
        if (linkPage === currentPage) {
            link.style.display = 'none'; // Oculta el enlace si coincide
        }
    });

    if (userData && userNameElement) {
        userNameElement.textContent = `Bienvenido, ${userData.vendedorName}`;
    }

    if (userData && userData.role !== 'admin') {
        adminElements.forEach(el => el.remove());
    }

    const handleLogout = (e) => {
        e.preventDefault();
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    };

    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleLogout);

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menu.classList.toggle('active');
            menuBtn.classList.toggle('fa-bars');
            menuBtn.classList.toggle('fa-times');
        });
    }
}

document.addEventListener('DOMContentLoaded', loadHeader);
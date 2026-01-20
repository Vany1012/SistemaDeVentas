document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuBtn');
    const menu = document.getElementById('hamburgerLinks');

    menuBtn.addEventListener('click', () => {
        menu.classList.toggle('active');
        if(menu.classList.contains('active')) {
            menuBtn.classList.remove('fa-bars');
            menuBtn.classList.add('fa-times');
        } else {
            menuBtn.classList.add('fa-bars');
            menuBtn.classList.remove('fa-times');
        }
    });
});

const userData = document.getElementById('user-role');
const adminExclusive = document.querySelectorAll('.admin-exclusive');
const userSession = JSON.parse(localStorage.userSession);
console.log(userSession.role);

userData.innerHTML = `Bienvenido, ${userSession.vendedorName}`;
if (userSession.role !== 'admin') {
    adminExclusive.forEach(element => {
        element.style.display = 'none';
    });
};
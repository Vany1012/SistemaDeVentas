document.addEventListener('DOMContentLoaded', () => {
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
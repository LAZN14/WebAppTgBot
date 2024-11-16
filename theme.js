document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Обработчик клика по кнопке темы
    themeToggle.addEventListener('click', () => {
        themeMenu.classList.toggle('active');
    });
    
    // Закрываем меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-switcher')) {
            themeMenu.classList.remove('active');
        }
    });
    
    // Обработчик выбора темы
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            themeMenu.classList.remove('active');
            
            // Анимация смены темы
            document.documentElement.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                document.documentElement.style.transition = '';
            }, 300);
        });
    });
}); 
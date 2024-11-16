document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Обработчик клика по кнопке темы
    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
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
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = option.getAttribute('data-theme');
            applyTheme(theme);
            themeMenu.classList.remove('active');
        });
    });

    // Функция применения темы
    function applyTheme(theme) {
        document.documentElement.style.transition = 'all 0.3s ease';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Обновляем иконку кнопки в зависимости от темы
        const themeIcons = {
            'light': '☀️',
            'dark': '🌙',
            'gradient': '🌈'
        };
        themeToggle.textContent = themeIcons[theme];
        
        // Сбрасываем transition после применения темы
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }
}); 
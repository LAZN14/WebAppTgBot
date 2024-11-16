document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const residentsBtn = document.getElementById('residents-btn');
    const intercomBtn = document.getElementById('intercom-btn');
    const faceidBtn = document.getElementById('faceid-btn');

    // Обработка кнопок главного меню
    residentsBtn.addEventListener('click', function() {
        showNotification('Переход к списку жильцов...');
        // Здесь должна быть логика перехода к списку жильцов
    });

    intercomBtn.addEventListener('click', function() {
        showNotification('Переход к управлению домофоном...');
        // Здесь должна быть логика управления домофоном
    });

    faceidBtn.addEventListener('click', function() {
        window.location.href = 'faceid-setup.html';
    });

    function showNotification(message) {
        tg.showPopup({
            title: 'Уведомление',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }
}); 
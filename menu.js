document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const residentsBtn = document.getElementById('residents-btn');
    const intercomBtn = document.getElementById('intercom-btn');
    const faceidBtn = document.getElementById('faceid-btn');

    // Проверяем, настроен ли Face ID
    const hasFaceID = localStorage.getItem('faceData');
    if (hasFaceID) {
        // Если Face ID уже настроен, меняем текст кнопки
        faceidBtn.innerHTML = `
            <span class="icon">👤</span>
            Сбросить Face ID
        `;
    }

    // Обработка кнопок главного меню
    residentsBtn.addEventListener('click', function() {
        showNotification('Переход к списку жильцов...');
    });

    intercomBtn.addEventListener('click', function() {
        showNotification('Переход к управлению домофоном...');
    });

    faceidBtn.addEventListener('click', function() {
        if (hasFaceID) {
            // Если Face ID уже настроен, предлагаем сбросить
            tg.showConfirm('Вы уверены, что хотите сбросить Face ID?', (confirmed) => {
                if (confirmed) {
                    localStorage.removeItem('faceData');
                    showNotification('Face ID успешно сброшен');
                    window.location.reload();
                }
            });
        } else {
            // Если Face ID не настроен, переходим к настройке
            window.location.href = 'faceid-setup.html';
        }
    });

    function showNotification(message) {
        tg.showPopup({
            title: 'Уведомление',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }
}); 
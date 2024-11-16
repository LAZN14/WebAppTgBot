document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const phoneInput = document.getElementById('phone');
    const submitPhone = document.getElementById('submit-phone');

    // Форматирование номера телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '+' + value;
        }
        e.target.value = value;
    });

    // Обработка авторизации
    submitPhone.addEventListener('click', function() {
        const phone = phoneInput.value;
        if (phone.length < 12) {
            showNotification('Введите корректный номер телефона');
            return;
        }

        // После успешной авторизации перенаправляем на страницу меню
        window.location.href = 'menu.html';
    });

    // Функция для показа уведомлений
    function showNotification(message) {
        tg.showPopup({
            title: 'Уведомление',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }
}); 
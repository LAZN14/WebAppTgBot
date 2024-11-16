document.addEventListener('DOMContentLoaded', function() {
    const tg = window.Telegram.WebApp;
    tg.expand();

    const phoneInput = document.getElementById('phone');
    const submitPhone = document.getElementById('submit-phone');
    const faceidLogin = document.getElementById('faceid-login');

    // Форматирование номера телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            value = '+' + value;
        }
        e.target.value = value;
    });

    // Обработка авторизации по номеру телефона
    submitPhone.addEventListener('click', function() {
        const phone = phoneInput.value;
        if (phone.length < 12) {
            showNotification('Введите корректный номер телефона');
            return;
        }
        window.location.href = 'menu.html';
    });

    // Обработка входа по Face ID
    faceidLogin.addEventListener('click', function() {
        // Всегда перенаправляем на страницу проверки Face ID
        window.location.href = 'faceid-verify.html';
    });

    function showNotification(message) {
        tg.showPopup({
            title: 'Уведомление',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }
}); 
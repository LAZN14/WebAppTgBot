document.addEventListener('DOMContentLoaded', function() {
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
            alert('Введите корректный номер телефона');
            return;
        }
        window.location.href = 'menu.html';
    });
}); 
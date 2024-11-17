document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    const submitPhone = document.getElementById('submit-phone');
    const errorText = document.getElementById('error-text');

    // Устанавливаем начальное значение
    phoneInput.value = '+';

    // Форматирование номера телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value;
        
        // Убираем все символы кроме цифр и плюса
        value = value.replace(/[^\d+]/g, '');
        
        // Проверяем, есть ли плюс в начале
        if (!value.startsWith('+')) {
            value = '+' + value;
        }
        
        // Ограничиваем длину (+ и 11 цифр)
        if (value.length > 12) {
            value = value.slice(0, 12);
        }
        
        e.target.value = value;
    });

    // Обработка авторизации
    submitPhone.addEventListener('click', function() {
        const phone = phoneInput.value;
        
        if (phone.length !== 12) { // +7XXXXXXXXXX (12 символов)
            errorText.textContent = 'Введите корректный номер телефона';
            errorText.style.display = 'block';
            phoneInput.classList.add('error');
            return;
        }

        errorText.style.display = 'none';
        phoneInput.classList.remove('error');
        
        // Анимация загрузки
        submitPhone.disabled = true;
        submitPhone.innerHTML = '<div class="spinner"></div>';
        
        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 1500);
    });
}); 
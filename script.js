document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    const submitPhone = document.getElementById('submit-phone');
    const errorText = document.getElementById('error-text');

    // Форматирование номера телефона
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 11) {
            value = value.slice(0, 11);
        }
        
        if (value.length > 0) {
            // Форматирование: +7 (XXX) XXX-XX-XX
            let formattedValue = '+7';
            if (value.length > 1) {
                formattedValue += ' (' + value.slice(1, 4);
            }
            if (value.length > 4) {
                formattedValue += ') ' + value.slice(4, 7);
            }
            if (value.length > 7) {
                formattedValue += '-' + value.slice(7, 9);
            }
            if (value.length > 9) {
                formattedValue += '-' + value.slice(9, 11);
            }
            e.target.value = formattedValue;
        }
    });

    // Обработка авторизации
    submitPhone.addEventListener('click', function() {
        const phone = phoneInput.value.replace(/\D/g, '');
        
        if (phone.length !== 11) {
            errorText.textContent = 'Введите корректный номер телефона';
            errorText.style.display = 'block';
            phoneInput.classList.add('error');
            return;
        }

        // Здесь должен быть API запрос на сервер для проверки номера
        // Пока просто имитируем успешную авторизацию
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
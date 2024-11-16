document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const captureBtn = document.getElementById('capture-btn');
    const saveBtn = document.getElementById('save-btn');
    const preview = document.getElementById('preview');
    const tg = window.Telegram.WebApp;

    let stream = null;
    let capturedImage = null;

    // Запрашиваем доступ к камере
    async function startCamera() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            video.srcObject = stream;
        } catch (err) {
            showNotification('Ошибка доступа к камере: ' + err.message);
        }
    }

    // Делаем снимок
    captureBtn.addEventListener('click', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        capturedImage = canvas.toDataURL('image/jpeg');
        preview.src = capturedImage;
        preview.parentElement.classList.remove('hidden');
        saveBtn.disabled = false;
    });

    // Сохраняем Face ID
    saveBtn.addEventListener('click', async () => {
        if (capturedImage) {
            // Здесь будет логика сохранения изображения
            localStorage.setItem('faceID', capturedImage);
            showNotification('Face ID успешно сохранен!');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        }
    });

    function showNotification(message) {
        tg.showPopup({
            title: 'Face ID',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }

    // Обновляем menu.js для обработки новой кнопки
    startCamera();
}); 
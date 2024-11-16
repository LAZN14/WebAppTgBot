document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const verifyBtn = document.getElementById('verify-btn');
    const tg = window.Telegram.WebApp;

    let stream = null;

    // Запускаем камеру
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

    // Проверка Face ID
    verifyBtn.addEventListener('click', async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const capturedImage = canvas.toDataURL('image/jpeg');

        // В реальном приложении ��десь должно быть сравнение с сохраненным Face ID
        // Для демонстрации просто сравниваем с сохраненным изображением
        const savedFaceID = localStorage.getItem('faceID');
        
        if (savedFaceID) {
            // Имитируем успешную проверку
            showNotification('Face ID подтвержден!');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            showNotification('Ошибка проверки Face ID');
        }
    });

    function showNotification(message) {
        tg.showPopup({
            title: 'Face ID',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }

    // Запускаем камеру при загрузке
    startCamera();
}); 
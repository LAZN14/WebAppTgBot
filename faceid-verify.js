document.addEventListener('DOMContentLoaded', async function() {
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const status = document.getElementById('status');
    const tg = window.Telegram.WebApp;

    let model = null;
    let stream = null;
    let isProcessing = false;
    let detectionCount = 0;
    const requiredDetections = 30; // Количество успешных определений для подтверждения

    // Загружаем модель
    async function loadModel() {
        status.textContent = 'Загрузка системы...';
        try {
            model = await blazeface.load();
            status.textContent = 'Поместите лицо в рамку';
        } catch (err) {
            status.textContent = 'Ошибка инициализации';
            showNotification('Ошибка загрузки: ' + err.message);
        }
    }

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
            
            video.addEventListener('play', () => {
                overlay.width = video.videoWidth;
                overlay.height = video.videoHeight;
                detectFace();
            });

        } catch (err) {
            status.textContent = 'Нет доступа к камере';
            showNotification('Ошибка камеры: ' + err.message);
        }
    }

    // Распознавание лица в реальном времени
    async function detectFace() {
        if (!model || isProcessing) return;
        isProcessing = true;

        try {
            const predictions = await model.estimateFaces(video, false);
            const ctx = overlay.getContext('2d');
            ctx.clearRect(0, 0, overlay.width, overlay.height);

            if (predictions.length === 1) {
                const face = predictions[0];
                const { topLeft, bottomRight, landmarks } = face;
                
                // Проверяем положение и размер лица
                const faceWidth = bottomRight[0] - topLeft[0];
                const faceHeight = bottomRight[1] - topLeft[1];
                const centerX = (topLeft[0] + bottomRight[0]) / 2;
                const centerY = (topLeft[1] + bottomRight[1]) / 2;
                
                const isGoodPosition = 
                    faceWidth > overlay.width * 0.2 && 
                    faceWidth < overlay.width * 0.8 &&
                    faceHeight > overlay.height * 0.2 &&
                    faceHeight < overlay.height * 0.8 &&
                    centerX > overlay.width * 0.3 &&
                    centerX < overlay.width * 0.7 &&
                    centerY > overlay.height * 0.3 &&
                    centerY < overlay.height * 0.7;

                // Отрисовка рамки и ориентиров
                ctx.strokeStyle = isGoodPosition ? '#00ff00' : '#ff0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.rect(topLeft[0], topLeft[1], faceWidth, faceHeight);
                ctx.stroke();

                // Отрисовка ориентиров
                landmarks.forEach(point => {
                    ctx.fillStyle = '#00ff00';
                    ctx.beginPath();
                    ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
                    ctx.fill();
                });

                if (isGoodPosition) {
                    detectionCount++;
                    status.textContent = `Удерживайте положение... ${Math.floor((detectionCount/requiredDetections) * 100)}%`;
                    
                    if (detectionCount >= requiredDetections) {
                        status.textContent = 'Лицо подтверждено!';
                        setTimeout(() => {
                            window.location.href = 'menu.html';
                        }, 1000);
                        return;
                    }
                } else {
                    detectionCount = 0;
                    status.textContent = 'Поместите лицо в центр кадра';
                }
            } else {
                detectionCount = 0;
                status.textContent = predictions.length === 0 ? 
                    'Лицо не обнаружено' : 
                    'Обнаружено более одного лица';
            }
        } catch (err) {
            console.error(err);
            status.textContent = 'Ошибка распознавания';
        }

        isProcessing = false;
        requestAnimationFrame(detectFace);
    }

    function showNotification(message) {
        tg.showPopup({
            title: 'Face ID',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }

    // Инициализация
    await loadModel();
    await startCamera();
}); 
document.addEventListener('DOMContentLoaded', async function() {
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const status = document.getElementById('status');
    const tg = window.Telegram.WebApp;

    let stream = null;
    let isProcessing = false;

    // Загружаем модели для распознавания лиц
    async function loadModels() {
        status.textContent = 'Загрузка моделей...';
        try {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models')
            ]);
            status.textContent = 'Поиск лица...';
        } catch (err) {
            status.textContent = 'Ошибка загрузки моделей';
            showNotification('Ошибка инициализации: ' + err.message);
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
            
            // Настраиваем размеры canvas для наложения
            video.addEventListener('play', () => {
                const displaySize = { 
                    width: video.videoWidth, 
                    height: video.videoHeight 
                };
                faceapi.matchDimensions(overlay, displaySize);
            });

            // Запускаем распознавание
            video.addEventListener('play', () => {
                detectFace();
            });

        } catch (err) {
            status.textContent = 'Ошибка доступа к камере';
            showNotification('Ошибка камеры: ' + err.message);
        }
    }

    // Распознавание лица в реальном времени
    async function detectFace() {
        if (isProcessing) return;
        isProcessing = true;

        try {
            const detection = await faceapi.detectSingleFace(
                video, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                // Очищаем предыдущие отрисовки
                const ctx = overlay.getContext('2d');
                ctx.clearRect(0, 0, overlay.width, overlay.height);

                // Отрисовываем рамку вокруг лица
                const resizedDetection = faceapi.resizeResults(detection, {
                    width: overlay.width,
                    height: overlay.height
                });
                faceapi.draw.drawDetections(overlay, [resizedDetection]);

                // Проверяем соответствие лица
                const savedDescriptor = localStorage.getItem('faceDescriptor');
                if (savedDescriptor) {
                    const distance = faceapi.euclideanDistance(
                        detection.descriptor,
                        Float32Array.from(JSON.parse(savedDescriptor))
                    );

                    if (distance < 0.6) { // Порог схожести
                        status.textContent = 'Лицо подтверждено!';
                        setTimeout(() => {
                            window.location.href = 'menu.html';
                        }, 1000);
                        return;
                    }
                }
                status.textContent = 'Поиск лица...';
            } else {
                status.textContent = 'Лицо не обнаружено';
            }
        } catch (err) {
            status.textContent = 'Ошибка распознавания';
            console.error(err);
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
    await loadModels();
    await startCamera();
}); 
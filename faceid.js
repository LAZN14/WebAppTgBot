document.addEventListener('DOMContentLoaded', async function() {
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const saveBtn = document.getElementById('save-btn');
    const status = document.getElementById('status');
    const tg = window.Telegram.WebApp;

    let stream = null;
    let isProcessing = false;

    // Загружаем модели
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
            
            video.addEventListener('play', () => {
                const displaySize = { 
                    width: video.videoWidth, 
                    height: video.videoHeight 
                };
                faceapi.matchDimensions(overlay, displaySize);
                detectFace();
            });

        } catch (err) {
            status.textContent = 'Ошибка доступа к камере';
            showNotification('Ошибка камеры: ' + err.message);
        }
    }

    // Распознавание лица
    async function detectFace() {
        if (isProcessing) return;
        isProcessing = true;

        try {
            const detection = await faceapi.detectSingleFace(
                video, 
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceDescriptor();

            if (detection) {
                const ctx = overlay.getContext('2d');
                ctx.clearRect(0, 0, overlay.width, overlay.height);

                const resizedDetection = faceapi.resizeResults(detection, {
                    width: overlay.width,
                    height: overlay.height
                });
                faceapi.draw.drawDetections(overlay, [resizedDetection]);
                
                saveBtn.disabled = false;
                status.textContent = 'Лицо обнаружено';
            } else {
                status.textContent = 'Поиск лица...';
                saveBtn.disabled = true;
            }
        } catch (err) {
            status.textContent = 'Ошибка распознавания';
            console.error(err);
        }

        isProcessing = false;
        requestAnimationFrame(detectFace);
    }

    // Сохранение Face ID
    saveBtn.addEventListener('click', async () => {
        const detection = await faceapi.detectSingleFace(
            video, 
            new faceapi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
            localStorage.setItem('faceDescriptor', JSON.stringify(Array.from(detection.descriptor)));
            showNotification('Face ID успешно сохранен!');
            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1500);
        } else {
            showNotification('Не удалось обнаружить лицо. Попробуйте еще раз.');
        }
    });

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
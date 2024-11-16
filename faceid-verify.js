document.addEventListener('DOMContentLoaded', async function() {
    const video = document.getElementById('video');
    const overlay = document.getElementById('overlay');
    const status = document.getElementById('status');
    const tg = window.Telegram.WebApp;

    let model = null;
    let stream = null;
    let isProcessing = false;
    let detectionCount = 0;
    const requiredDetections = 30;

    // Проверяем, есть ли сохраненное лицо
    const savedFaceData = localStorage.getItem('faceData');
    if (!savedFaceData) {
        showNotification('Face ID не настроен');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }
    const savedFace = JSON.parse(savedFaceData);

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

                ctx.strokeStyle = isGoodPosition ? '#00ff00' : '#ff0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.rect(topLeft[0], topLeft[1], faceWidth, faceHeight);
                ctx.stroke();

                landmarks.forEach(point => {
                    ctx.fillStyle = '#00ff00';
                    ctx.beginPath();
                    ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
                    ctx.fill();
                });

                if (isGoodPosition) {
                    // Проверяем совпадение лица
                    const similarity = compareFaces(landmarks, savedFace.landmarks);
                    
                    if (similarity > 0.7) { // Порог схожести (70%)
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
                        status.textContent = 'Лицо не распознано';
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

    // Функция сравнения лиц
    function compareFaces(landmarks1, landmarks2) {
        let similarity = 0;
        const totalPoints = landmarks1.length;

        // Нормализуем координаты точек
        const normalizedLandmarks1 = normalizeLandmarks(landmarks1);
        const normalizedLandmarks2 = normalizeLandmarks(landmarks2);

        // Считаем схожесть каждой точки
        for (let i = 0; i < totalPoints; i++) {
            const dx = normalizedLandmarks1[i][0] - normalizedLandmarks2[i][0];
            const dy = normalizedLandmarks1[i][1] - normalizedLandmarks2[i][1];
            const distance = Math.sqrt(dx * dx + dy * dy);
            similarity += 1 - Math.min(distance, 1);
        }

        return similarity / totalPoints;
    }

    // Нормализация координат точек лица
    function normalizeLandmarks(landmarks) {
        // Находим центр и масштаб
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        landmarks.forEach(point => {
            minX = Math.min(minX, point[0]);
            minY = Math.min(minY, point[1]);
            maxX = Math.max(maxX, point[0]);
            maxY = Math.max(maxY, point[1]);
        });

        const width = maxX - minX;
        const height = maxY - minY;
        const scale = Math.max(width, height);
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        // Нормализуем координаты
        return landmarks.map(point => [
            (point[0] - centerX) / scale,
            (point[1] - centerY) / scale
        ]);
    }

    function showNotification(message) {
        tg.showPopup({
            title: 'Face ID',
            message: message,
            buttons: [{type: 'ok'}]
        });
    }

    await loadModel();
    await startCamera();
}); 
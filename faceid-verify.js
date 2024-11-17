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
        showNotification('Face ID не настроен. Сначала настройте Face ID в меню.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

    const savedFace = JSON.parse(savedFaceData);
    if (!savedFace || !savedFace.landmarks) {
        localStorage.removeItem('faceData'); // Удаляем некорректные данные
        showNotification('Ошибка данных Face ID. Настройте Face ID заново.');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        return;
    }

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
                
                const isGoodPosition = checkFacePosition(face, overlay);
                drawFaceFrame(ctx, face, isGoodPosition);

                if (isGoodPosition) {
                    const similarity = compareFaces(face, savedFace);
                    
                    if (similarity > 0.95) { // Увеличиваем порог схожести до 95%
                        detectionCount++;
                        status.textContent = `Проверка... ${Math.floor((detectionCount/requiredDetections) * 100)}%`;
                        
                        if (detectionCount >= requiredDetections) {
                            status.textContent = 'Лицо подтверждено!';
                            if (stream) {
                                stream.getTracks().forEach(track => track.stop());
                            }
                            setTimeout(() => {
                                window.location.href = 'menu.html';
                            }, 1000);
                            return;
                        }
                    } else {
                        detectionCount = 0;
                        if (similarity > 0.85) {
                            status.textContent = 'Похоже, но не совпадает';
                        } else if (similarity > 0.7) {
                            status.textContent = 'Лицо не распознано';
                        } else {
                            status.textContent = 'Лицо не совпадает';
                        }
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

    function checkFacePosition(face, canvas) {
        const { topLeft, bottomRight } = face;
        const faceWidth = bottomRight[0] - topLeft[0];
        const faceHeight = bottomRight[1] - topLeft[1];
        const centerX = (topLeft[0] + bottomRight[0]) / 2;
        const centerY = (topLeft[1] + bottomRight[1]) / 2;
        
        return (
            faceWidth > canvas.width * 0.2 && 
            faceWidth < canvas.width * 0.8 &&
            faceHeight > canvas.height * 0.2 &&
            faceHeight < canvas.height * 0.8 &&
            centerX > canvas.width * 0.3 &&
            centerX < canvas.width * 0.7 &&
            centerY > canvas.height * 0.3 &&
            centerY < canvas.height * 0.7
        );
    }

    function drawFaceFrame(ctx, face, isGoodPosition) {
        const { topLeft, bottomRight, landmarks } = face;
        
        // Рамка
        ctx.strokeStyle = isGoodPosition ? '#00ff00' : '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.rect(topLeft[0], topLeft[1], 
                bottomRight[0] - topLeft[0], 
                bottomRight[1] - topLeft[1]);
        ctx.stroke();

        // Точки лица
        landmarks.forEach(point => {
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(point[0], point[1], 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    function compareFaces(face1, face2) {
        try {
            const landmarks1 = normalizeLandmarks(face1.landmarks);
            const landmarks2 = normalizeLandmarks(face2.landmarks);
            
            // Проверяем количество точек
            if (landmarks1.length !== landmarks2.length) {
                console.log('Разное количество точек');
                return 0;
            }

            // Вычисляем несколько метрик схожести
            
            // 1. Расстояние между соответствующими точками
            let totalDistance = 0;
            let maxDistance = 0;
            const distances = [];
            
            for (let i = 0; i < landmarks1.length; i++) {
                const dx = landmarks1[i][0] - landmarks2[i][0];
                const dy = landmarks1[i][1] - landmarks2[i][1];
                const distance = Math.sqrt(dx * dx + dy * dy);
                distances.push(distance);
                totalDistance += distance;
                maxDistance = Math.max(maxDistance, distance);
            }

            // 2. Проверяем пропорции лица
            const face1Width = face1.bottomRight[0] - face1.topLeft[0];
            const face1Height = face1.bottomRight[1] - face1.topLeft[1];
            const face2Width = face2.faceSize.width;
            const face2Height = face2.faceSize.height;
            
            const aspectRatio1 = face1Width / face1Height;
            const aspectRatio2 = face2Width / face2Height;
            const ratioDiff = Math.abs(aspectRatio1 - aspectRatio2);

            // 3. Проверяем относительные расстояния между ключевыми точками
            const relativeDists1 = calculateRelativeDistances(landmarks1);
            const relativeDists2 = calculateRelativeDistances(landmarks2);
            let relativeDistsError = 0;
            
            for (let i = 0; i < relativeDists1.length; i++) {
                relativeDistsError += Math.abs(relativeDists1[i] - relativeDists2[i]);
            }

            // Вычисляем финальную оценку схожести
            const avgDistance = totalDistance / landmarks1.length;
            const normalizedMaxDistance = maxDistance / landmarks1.length;
            const distanceVariance = calculateVariance(distances);

            const similarity = 1 - (
                avgDistance * 0.3 +          // Среднее расстояние
                normalizedMaxDistance * 0.2 + // Максимальное отклонение
                ratioDiff * 0.2 +            // Разница пропорций
                relativeDistsError * 0.2 +    // Ошибка относительных расстояний
                distanceVariance * 0.1        // Вариативность расстояний
            );

            // Выводим детальную информацию для отладки
            console.log('Similarity details:', {
                avgDistance,
                normalizedMaxDistance,
                ratioDiff,
                relativeDistsError,
                distanceVariance,
                finalSimilarity: similarity
            });

            return similarity;
        } catch (err) {
            console.error('Ошибка сравнения лиц:', err);
            return 0;
        }
    }

    // Вычисление относительных расстояний между точками
    function calculateRelativeDistances(landmarks) {
        const distances = [];
        for (let i = 0; i < landmarks.length; i++) {
            for (let j = i + 1; j < landmarks.length; j++) {
                const dx = landmarks[i][0] - landmarks[j][0];
                const dy = landmarks[i][1] - landmarks[j][1];
                distances.push(Math.sqrt(dx * dx + dy * dy));
            }
        }
        return distances;
    }

    // Вычисление дисперсии
    function calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        return squareDiffs.reduce((a, b) => a + b, 0) / values.length;
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
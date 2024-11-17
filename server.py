from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import numpy as np
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Конфигурация базы данных
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('DB_PASSWORD'),
    'database': 'face_id_db'
}

# Создание таблицы при запуске
def init_db():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS face_data (
            id INT AUTO_INCREMENT PRIMARY KEY,
            phone_number VARCHAR(15) NOT NULL,
            face_landmarks JSON NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    cursor.close()
    conn.close()

# Сохранение Face ID
@app.route('/save-face', methods=['POST'])
def save_face():
    data = request.json
    phone_number = data.get('phone')
    face_landmarks = data.get('landmarks')
    
    if not phone_number or not face_landmarks:
        return jsonify({'error': 'Missing data'}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Проверяем, существует ли уже запись для этого номера
        cursor.execute('SELECT id FROM face_data WHERE phone_number = %s', (phone_number,))
        existing = cursor.fetchone()
        
        if existing:
            # Обновляем существующую запись
            cursor.execute('''
                UPDATE face_data 
                SET face_landmarks = %s 
                WHERE phone_number = %s
            ''', (json.dumps(face_landmarks), phone_number))
        else:
            # Создаем новую запись
            cursor.execute('''
                INSERT INTO face_data (phone_number, face_landmarks)
                VALUES (%s, %s)
            ''', (phone_number, json.dumps(face_landmarks)))
        
        conn.commit()
        return jsonify({'success': True})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Проверка Face ID
@app.route('/verify-face', methods=['POST'])
def verify_face():
    data = request.json
    current_landmarks = data.get('landmarks')
    
    if not current_landmarks:
        return jsonify({'error': 'No face data provided'}), 400
    
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)
        
        # Получаем все сохраненные лица
        cursor.execute('SELECT phone_number, face_landmarks FROM face_data')
        saved_faces = cursor.fetchall()
        
        for face in saved_faces:
            saved_landmarks = json.loads(face['face_landmarks'])
            similarity = compare_faces(current_landmarks, saved_landmarks)
            
            if similarity > 0.7:  # Порог схожести
                return jsonify({
                    'success': True,
                    'phone_number': face['phone_number']
                })
        
        return jsonify({
            'success': False,
            'message': 'Face not recognized'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

def compare_faces(landmarks1, landmarks2):
    try:
        # Нормализация координат
        norm1 = normalize_landmarks(landmarks1)
        norm2 = normalize_landmarks(landmarks2)
        
        # Вычисление евклидова расстояния
        distance = np.sqrt(np.sum((np.array(norm1) - np.array(norm2)) ** 2))
        similarity = 1 / (1 + distance)
        
        return similarity
    except:
        return 0

def normalize_landmarks(landmarks):
    points = np.array(landmarks)
    center = points.mean(axis=0)
    points -= center
    scale = np.sqrt((points ** 2).sum(axis=1)).mean()
    points /= scale
    return points.tolist()

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000) 
import dotenv from 'dotenv';
dotenv.config(); // ← загружает переменные из .env

import AWS from 'aws-sdk';
import { globSync } from 'glob';
import fs from 'fs-extra';
import path from 'path';

// === КОНФИГУРАЦИЯ ===
const BUCKET_NAME = 'dental-job.ru';
const BUILD_DIR = './dist'; // или './build' — укажите вашу папку сборки
const REGION = 'ru-central1';
const ENDPOINT = 'https://storage.yandexcloud.net';

// === ИНИЦИАЛИЗАЦИЯ S3 КЛИЕНТА ===
const s3 = new AWS.S3({
  endpoint: ENDPOINT,
  region: REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // обязательно для Yandex
  signatureVersion: 'v4',
});

// Определяем MIME-тип по расширению
const getContentType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
  };
  return types[ext] || 'application/octet-stream';
};

// Получаем список всех файлов в BUILD_DIR
const getFiles = (dir) =>
  globSync('**/*', { cwd: dir, dot: true, nodir: true }).map((file) =>
    path.join(dir, file)
  );

// Загрузка одного файла
const uploadFile = async (filePath) => {
  const key = path.relative(BUILD_DIR, filePath).replace(/\\/g, '/');
  const body = await fs.readFile(filePath);
  const contentType = getContentType(filePath);

  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
    ACL: 'public-read',
    CacheControl:
      contentType.includes('text/html') || contentType.includes('application/json')
        ? 'public, max-age=0, must-revalidate' // HTML — не кэшировать агрессивно
        : 'public, max-age=31536000', // JS, CSS, изображения — кэшировать год
  };

  await s3.putObject(params).promise();
  console.log(`✅ Загружен: ${key}`);
};

// Основная функция деплоя
async function deploy() {
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('❌ Установите AWS_ACCESS_KEY_ID и AWS_SECRET_ACCESS_KEY в переменные окружения!');
  }

  if (!(await fs.pathExists(BUILD_DIR))) {
    throw new Error(`❌ Папка сборки не найдена: ${BUILD_DIR}`);
  }

  console.log(`🚀 Начинаем деплой в бакет: ${BUCKET_NAME}`);
  console.log(`📁 Папка сборки: ${BUILD_DIR}`);

  const entry = path.join(BUILD_DIR, 'index.html');
  const files = getFiles(BUILD_DIR);
  if (!files.includes(entry)) {
    throw new Error('В сборке отсутствует index.html');
  }

  // Старый HTML может ещё находиться в кэше у посетителей.
  // Сначала публикуем ресурсы, затем переключаем входную страницу.
  const assets = files.filter((file) => file !== entry);
  const batchSize = 10;
  for (let i = 0; i < assets.length; i += batchSize) {
    await Promise.all(assets.slice(i, i + batchSize).map(uploadFile));
  }
  await uploadFile(entry);
  console.log(`✅ Сборка опубликована в бакете ${BUCKET_NAME}`);
}

// Запуск
deploy().catch((err) => {
  console.error('💥 Ошибка деплоя:', err.message);
  process.exit(1);
});
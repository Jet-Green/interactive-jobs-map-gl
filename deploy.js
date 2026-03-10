import dotenv from 'dotenv';
dotenv.config(); // ← загружает переменные из .env

import AWS from 'aws-sdk';
import { globSync } from 'glob';
import fs from 'fs-extra';
import path from 'path';

// === КОНФИГУРАЦИЯ ===
const BUCKET_NAME = 'interactive-map';
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

// Удаление файлов, которых больше нет в локальной сборке
const deleteObsoleteFiles = async (localFiles) => {
  const localKeys = new Set(
    localFiles.map((f) => path.relative(BUILD_DIR, f).replace(/\\/g, '/'))
  );

  let continuationToken = null;
  let deletedCount = 0;

  do {
    const listParams = {
      Bucket: BUCKET_NAME,
      ContinuationToken: continuationToken,
    };

    const data = await s3.listObjectsV2(listParams).promise();
    const remoteKeys = (data.Contents || []).map((obj) => obj.Key);

    const toDelete = remoteKeys.filter((key) => !localKeys.has(key));
    if (toDelete.length > 0) {
      const deleteParams = {
        Bucket: BUCKET_NAME,
        Delete: {
          Objects: toDelete.map((Key) => ({ Key })),
        },
      };
      await s3.deleteObjects(deleteParams).promise();
      deletedCount += toDelete.length;
      toDelete.forEach((key) => console.log(`🗑️ Удалён устаревший файл: ${key}`));
    }

    continuationToken = data.NextContinuationToken;
  } while (continuationToken);

  if (deletedCount > 0) {
    console.log(`🗑️ Всего удалено устаревших файлов: ${deletedCount}`);
  }
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

  // Получаем файлы
  const files = getFiles(BUILD_DIR);
  if (files.length === 0) {
    throw new Error('❌ Нет файлов для загрузки!');
  }

  console.log(`📂 Найдено файлов: ${files.length}`);

  // Удаляем устаревшие (опционально — можно закомментировать при первом запуске)
  await deleteObsoleteFiles(files);

  // Загружаем все файлы параллельно (но не слишком много)
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map(uploadFile));
  }

  console.log(`✅ Деплой завершён! Сайт доступен по: https://${BUCKET_NAME}`);
}

// Запуск
deploy().catch((err) => {
  console.error('💥 Ошибка деплоя:', err.message);
  process.exit(1);
});
interface PresignedUploadResponse {
  fileId: string;
  key: string;
  uploadUrl: string;
  contentType: string;
  expiresIn: number;
}

interface CompleteUploadResponse {
  fileId: string;
  url: string;
  key: string;
}

interface UploadAvatarParams {
  file: File;
  userId: string;
}

/**
 * Загружает аватар пользователя в S3 через presigned URL
 *
 * @param file - Файл изображения
 * @param userId - ID пользователя
 * @returns URL загруженного аватара
 */
export async function uploadAvatar({
  file,
  userId,
}: UploadAvatarParams): Promise<string> {
  try {
    console.log('Starting avatar upload:', { file, userId });
    console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
    // Шаг 1: Получить presigned URL с бекенда
    const presignResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/upload-avatar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: file.type,
          userId,
        }),
      },
    );

    if (!presignResponse.ok) {
      const error = await presignResponse.json();
      throw new Error(error.message || 'Failed to get upload URL');
    }

    const presignData: PresignedUploadResponse = await presignResponse.json();

    // Шаг 2: Загрузить файл напрямую в S3
    const uploadResponse = await fetch(presignData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload file to S3');
    }

    // Шаг 3: Уведомить бекенд о завершении загрузки
    const completeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/complete-avatar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: presignData.fileId,
          userId,
        }),
      },
    );

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.message || 'Failed to complete upload');
    }

    const completeData: CompleteUploadResponse = await completeResponse.json();

    // Возвращаем URL аватара
    return completeData.url;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}

/**
 * Загружает аватар с прогрессом
 */
export async function uploadAvatarWithProgress({
  file,
  userId,
  onProgress,
}: UploadAvatarParams & {
  onProgress?: (progress: number) => void;
}): Promise<string> {
  try {
    // Шаг 1: Получить presigned URL
    onProgress?.(10);
    const presignResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/upload-avatar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: file.type,
          userId,
        }),
      },
    );

    if (!presignResponse.ok) {
      throw new Error('Failed to get upload URL');
    }

    const presignData: PresignedUploadResponse = await presignResponse.json();
    onProgress?.(20);

    // Шаг 2: Загрузить с прогрессом через XMLHttpRequest
    const uploadedUrl = await uploadFileWithProgress(
      presignData.uploadUrl,
      file,
      (progress) => {
        // Прогресс от 20% до 80%
        onProgress?.(20 + Math.floor(progress * 0.6));
      },
    );

    onProgress?.(80);

    // Шаг 3: Завершить загрузку
    const completeResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/files/complete-avatar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: presignData.fileId,
          userId,
        }),
      },
    );

    if (!completeResponse.ok) {
      throw new Error('Failed to complete upload');
    }

    const completeData: CompleteUploadResponse = await completeResponse.json();
    onProgress?.(100);

    return completeData.url;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}

/**
 * Helper: Загрузка с прогрессом через XMLHttpRequest
 */
function uploadFileWithProgress(
  url: string,
  file: File,
  onProgress: (progress: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = event.loaded / event.total;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(url);
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}

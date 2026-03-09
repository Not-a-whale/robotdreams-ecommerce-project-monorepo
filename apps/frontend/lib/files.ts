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

function getApiUrl() {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://api:3000';
}

export async function uploadAvatar({
  file,
  userId,
}: UploadAvatarParams): Promise<string> {
  const apiUrl = getApiUrl();

  try {
    console.log('🚀 Step 1: Requesting presigned URL...');

    const presignResponse = await fetch(`${apiUrl}/files/upload-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: file.type,
        userId,
      }),
    });

    if (!presignResponse.ok) {
      const error = await presignResponse.json();
      throw new Error(error.message || 'Failed to get upload URL');
    }

    const presignData: PresignedUploadResponse = await presignResponse.json();
    console.log(
      '✅ Got presigned URL:',
      presignData.uploadUrl.substring(0, 50) + '...',
    );

    console.log('🚀 Step 2: Uploading to S3...');
    const uploadResponse = await fetch(presignData.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('S3 upload failed:', errorText);
      throw new Error('Failed to upload file to S3');
    }

    console.log('✅ Uploaded to S3');

    console.log('🚀 Step 3: Completing upload...');
    const completeResponse = await fetch(`${apiUrl}/files/complete-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: presignData.fileId,
        userId,
      }),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.message || 'Failed to complete upload');
    }

    const completeData: CompleteUploadResponse = await completeResponse.json();
    console.log('✅ Upload completed:', completeData.url);

    return completeData.url;
  } catch (error) {
    console.error('❌ Avatar upload error:', error);
    throw error;
  }
}

export async function uploadAvatarWithProgress({
  file,
  userId,
  onProgress,
}: UploadAvatarParams & {
  onProgress?: (progress: number) => void;
}): Promise<string> {
  const apiUrl = getApiUrl();

  try {
    onProgress?.(10);
    const presignResponse = await fetch(`${apiUrl}/files/upload-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: file.type,
        userId,
      }),
    });

    if (!presignResponse.ok) {
      const error = await presignResponse.json();
      throw new Error(error.message || 'Failed to get upload URL');
    }

    const presignData: PresignedUploadResponse = await presignResponse.json();
    onProgress?.(20);

    await uploadFileWithProgress(presignData.uploadUrl, file, (progress) => {
      onProgress?.(20 + Math.floor(progress * 60));
    });

    onProgress?.(80);

    const completeResponse = await fetch(`${apiUrl}/files/complete-avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: presignData.fileId,
        userId,
      }),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.message || 'Failed to complete upload');
    }

    const completeData: CompleteUploadResponse = await completeResponse.json();
    onProgress?.(100);

    return completeData.url;
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw error;
  }
}

function uploadFileWithProgress(
  url: string,
  file: File,
  onProgress: (progress: number) => void,
): Promise<void> {
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
        resolve();
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

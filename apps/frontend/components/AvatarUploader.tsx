'use client';

import { uploadAvatarWithProgress } from '@/lib/files';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface AvatarUploaderProps {
  userId: string;
  currentAvatarUrl?: string;
  onUploadComplete?: (avatarUrl: string) => void;
}

const ALLOWED_AVATAR_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'image/gif',
];

export function AvatarUploader({
  userId,
  currentAvatarUrl,
  onUploadComplete,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarUrl || null,
  );

  useEffect(() => {
    setPreviewUrl(currentAvatarUrl || null);
  }, [currentAvatarUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log(`🖼️ Avatar selected: ${file.name} (${file.type}, ${file.size} bytes)`);

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setError('Supported formats: JPG, JPEG, PNG, WEBP, GIF');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      console.log(`🚀 Starting avatar upload for user: ${userId}`);

      const avatarUrl = await uploadAvatarWithProgress({
        file,
        userId,
        onProgress: setProgress,
      });

      console.log('✅ Avatar uploaded:', avatarUrl);
      setPreviewUrl(avatarUrl);
      onUploadComplete?.(avatarUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreviewUrl(currentAvatarUrl || null);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            fill
            unoptimized
            sizes="128px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No avatar
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-sm">{Math.round(progress)}%</div>
          </div>
        )}
      </div>

      <label className="cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        <div className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400">
          {uploading ? 'Uploading...' : 'Upload Avatar!'}
        </div>
      </label>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}

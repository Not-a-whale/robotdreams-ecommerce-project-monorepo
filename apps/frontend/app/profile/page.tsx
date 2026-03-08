'use client';

import { AvatarUploader } from '@/components/AvatarUploader';
import { useUserStore } from '@/store/user-store';

export default function ProfilePage() {
  const user = useUserStore((state) => state.user);
  const setAvatarUrl = useUserStore((state) => state.setAvatarUrl);

  if (!user) {
    return (
      <div className="p-8 space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-gray-600">Please sign in to update your avatar.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Profiles</h1>
      <AvatarUploader
        userId={user.id}
        currentAvatarUrl={user.avatarUrl ?? undefined}
        onUploadComplete={setAvatarUrl}
      />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useUserStore, type LoggedInUser } from '@/store/user-store';

type UserStoreHydratorProps = {
  user: LoggedInUser | null;
};

export default function UserStoreHydrator({ user }: UserStoreHydratorProps) {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    if (user) {
      setUser(user);
      return;
    }

    clearUser();
  }, [user, setUser, clearUser]);

  return null;
}

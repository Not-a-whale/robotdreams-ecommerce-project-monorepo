'use client';

import { useEffect } from 'react';
import { useUserStore, type LoggedInUser } from '@/store/user-store';

type UserStoreHydratorProps = {
  user: LoggedInUser | null;
  token: string | null;
};

export default function UserStoreHydrator({
  user,
  token,
}: UserStoreHydratorProps) {
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const clearUser = useUserStore((state) => state.clearUser);

  useEffect(() => {
    if (user && token) {
      setUser(user);
      setToken(token);
      return;
    }

    clearUser();
  }, [user, token, setUser, setToken, clearUser]);

  return null;
}

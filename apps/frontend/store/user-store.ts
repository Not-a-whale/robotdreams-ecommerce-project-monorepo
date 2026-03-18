import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LoggedInUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type UserStoreState = {
  user: LoggedInUser | null;
  token: string | null;
  setUser: (user: LoggedInUser | null) => void;
  setToken: (token: string | null) => void;
  setAvatarUrl: (avatarUrl: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStoreState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      setAvatarUrl: (avatarUrl) =>
        set((state) => ({
          user: state.user ? { ...state.user, avatarUrl } : state.user,
        })),

      clearUser: () => set({ user: null, token: null }),
    }),
    {
      name: 'user-storage',
    },
  ),
);

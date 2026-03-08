import { create } from 'zustand';

export type LoggedInUser = {
  id: string;
  name: string;
  avatarUrl?: string | null;
};

type UserStoreState = {
  user: LoggedInUser | null;
  setUser: (user: LoggedInUser | null) => void;
  setAvatarUrl: (avatarUrl: string) => void;
  clearUser: () => void;
};

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  setAvatarUrl: (avatarUrl) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatarUrl } : state.user,
    })),
  clearUser: () => set({ user: null }),
}));

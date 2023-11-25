import { create } from "zustand";

interface ProfileState {
  hideProfile: boolean;
  setHideProfile: (popUpProfile: boolean) => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  hideProfile: true,
  setHideProfile: (hideProfile: boolean) => set({ hideProfile }),
}));

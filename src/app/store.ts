import { create } from "zustand";

interface ProfileState {
  popUpProfile: boolean;
  setPopUpProfile: (popUpProfile: boolean) => void;
}

export const useProfileStore = create<ProfileState>()((set) => ({
  popUpProfile: false,
  setPopUpProfile: (popUpProfile: boolean) => set({ popUpProfile }),
}));

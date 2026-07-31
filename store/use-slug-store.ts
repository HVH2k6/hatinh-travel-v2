import { create } from 'zustand';

interface SlugState {
  currentSlugs: Record<string, string> | null;
  setCurrentSlugs: (slugs: Record<string, string> | null) => void;
}

// Store này giống như một "đám mây" giữ mảng slug để Header có thể lấy xuống xài
export const useSlugStore = create<SlugState>((set) => ({
  currentSlugs: null,
  setCurrentSlugs: (slugs) => set({ currentSlugs: slugs }),
}));
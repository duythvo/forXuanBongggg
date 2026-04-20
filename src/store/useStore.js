import { create } from "zustand";

const useStore = create((set) => ({
  // Scene: 0=intro, 1=galaxy/memories, 3=finale (scene 2 removed)
  currentScene: 0,
  setScene: (scene) => set({ currentScene: scene }),
  nextScene: () =>
    set((state) => {
      const order = [0, 1, 3];
      const index = order.indexOf(state.currentScene);
      const nextIndex = Math.min(index + 1, order.length - 1);
      return { currentScene: order[nextIndex] };
    }),
  prevScene: () =>
    set((state) => {
      const order = [0, 1, 3];
      const index = order.indexOf(state.currentScene);
      const prevIndex = Math.max(index - 1, 0);
      return { currentScene: order[prevIndex] };
    }),

  // Memory card
  openCard: null,
  setOpenCard: (card) => set({ openCard: card }),
  closeCard: () => set({ openCard: null }),
  pendingFinalTransition: false,
  setPendingFinalTransition: (val) => set({ pendingFinalTransition: val }),

  // Audio
  isMuted: false,
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  // Cursor state
  cursorState: "default", // 'default' | 'hover-star' | 'hover-button'
  setCursorState: (state) => set({ cursorState: state }),

  // Camera ref for imperative animation
  cameraRef: null,
  setCameraRef: (ref) => set({ cameraRef: ref }),

  // Constellation tracking - for connecting stars
  clickedStars: [], // array of star ids in order of click
  addClickedStar: (starId) =>
    set((state) => {
      const updated = [...state.clickedStars, starId];
      if (updated.length > 5) {
        updated.shift(); // keep only last 5
      }
      return { clickedStars: updated };
    }),
  resetClickedStars: () => set({ clickedStars: [] }),

  // Constellation animation state
  constellationAnimating: false,
  setConstellationAnimating: (val) => set({ constellationAnimating: val }),
  constellationComplete: false,
  setConstellationComplete: (val) => set({ constellationComplete: val }),
}));

export default useStore;


import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { immer } from "zustand/middleware/immer"

interface CommunitySettingsState {
  activeSection: string
  activeItem: string

  setActive: (section: string, item: string) => void
  resetActive: () => void
}

export const useCommunitySettings = create<CommunitySettingsState>()(
  persist(
    immer((set) => ({
      activeSection: "General Settings",
      activeItem: "Community Info",

      setActive: (section, item) =>
        set((state) => {
          state.activeSection = section
          state.activeItem = item
        }),

      resetActive: () =>
        set((state) => {
          state.activeSection = ""
          state.activeItem = ""
        }),
    })),
    {
      name: "community-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
)


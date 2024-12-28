import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useConfigStore = create(
  persist(
    (set) => ({
      config: null,
      error: null,
      setConfig: (newConfig) => set({ config: newConfig }),
      clearConfig: () => set({ config: null, error: null }),
    }),
    {
      name: 'config-storage', // name of the item in storage
      getStorage: () => localStorage, // use sessionStorage if preferred
    }
  )
)

export default useConfigStore

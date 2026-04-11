/**
 * Global App Store — Zustand
 * Keep global state minimal: theme, auth, UI state
 */
import { create } from 'zustand'
import { storage } from '@utils/storage'

type Theme = 'light' | 'dark' | 'system'

interface LoadingState {
  [key: string]: boolean
}

interface AppState {
  /* Theme */
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void

  /* Loading */
  loading: LoadingState
  setLoading: (key: string, value: boolean) => void
  isLoading: (key: string) => boolean

  /* Navigation loading */
  isNavigating: boolean
  setNavigating: (val: boolean) => void

  /* Sidebar */
  sidebarOpen: boolean
  toggleSidebar: () => void
  setSidebar: (open: boolean) => void
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return theme
}

export const useAppStore = create<AppState>((set, get) => ({
  /* Theme */
  theme: storage.get<Theme>('theme', 'system'),
  resolvedTheme: resolveTheme(storage.get<Theme>('theme', 'system')),
  setTheme: (theme) => {
    const resolved = resolveTheme(theme)
    document.documentElement.setAttribute('data-theme', resolved)
    storage.set('theme', theme)
    set({ theme, resolvedTheme: resolved })
  },

  /* Loading */
  loading: {},
  setLoading: (key, value) =>
    set((s) => ({ loading: { ...s.loading, [key]: value } })),
  isLoading: (key) => get().loading[key] ?? false,

  /* Navigation loading */
  isNavigating: false,
  setNavigating: (val) => set({ isNavigating: val }),

  /* Sidebar */
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),
}))

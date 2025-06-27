import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AppState, User, UserPreferences } from '@/types'
import { appStorage } from '@/lib/storage'

const defaultPreferences: UserPreferences = {
  theme: 'system',
  notifications: {
    push: true,
    email: true,
    comments: true,
    votes: true,
  },
  defaultFilters: {},
}

interface AppStore extends AppState {
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setPreferences: (preferences: Partial<UserPreferences>) => void
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, _get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      preferences: defaultPreferences,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setPreferences: (newPreferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences },
        })),

      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),

      logout: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'emuready-app-store',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const value = appStorage.get(name)
          return value ? JSON.stringify(value) : null
        },
        setItem: (name, value) => appStorage.set(name, JSON.parse(value)),
        removeItem: (name) => appStorage.delete(name),
      })),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        preferences: state.preferences,
      }),
    },
  ),
)

// Selectors
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () =>
  useAppStore((state) => state.isAuthenticated)
export const useIsLoading = () => useAppStore((state) => state.isLoading)
export const usePreferences = () => useAppStore((state) => state.preferences)
export const useTheme = () => useAppStore((state) => state.preferences.theme)

// Actions
export const useAppActions = () =>
  useAppStore((state) => ({
    setUser: state.setUser,
    setLoading: state.setLoading,
    setPreferences: state.setPreferences,
    login: state.login,
    logout: state.logout,
    updateUser: state.updateUser,
  }))

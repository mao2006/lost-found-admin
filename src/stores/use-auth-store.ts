import type { AdminRole } from '@/constants/admin-access'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface LoginPayload {
  employeeNo: string
  role: AdminRole
}

interface AuthStore {
  employeeNo: string
  isLoggedIn: boolean
  login: (payload: LoginPayload) => void
  logout: () => void
  role: AdminRole | null
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      employeeNo: '',
      isLoggedIn: false,
      role: null,
      login: ({ employeeNo, role }) => {
        set({
          employeeNo,
          isLoggedIn: true,
          role,
        })
      },
      logout: () => {
        set({
          employeeNo: '',
          isLoggedIn: false,
          role: null,
        })
      },
    }),
    {
      name: 'lost-found-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

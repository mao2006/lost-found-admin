import type { AdminRole } from '@/constants/admin-access'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface LoginPayload {
  employeeNo: string
  token: string
  userId: number
  role: AdminRole
}

interface AuthStore {
  employeeNo: string
  isLoggedIn: boolean
  login: (payload: LoginPayload) => void
  logout: () => void
  role: AdminRole | null
  token: string
  userId: number | null
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      employeeNo: '',
      isLoggedIn: false,
      role: null,
      token: '',
      userId: null,
      login: ({ employeeNo, role, token, userId }) => {
        set({
          employeeNo,
          isLoggedIn: true,
          role,
          token,
          userId,
        })
      },
      logout: () => {
        set({
          employeeNo: '',
          isLoggedIn: false,
          role: null,
          token: '',
          userId: null,
        })
      },
    }),
    {
      name: 'lost-found-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

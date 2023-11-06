import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface LoginState {
  loginstate: string
  username: string
  changeState: (by: string) => void
  changeName: (by: string) => void
}

export const useLoginStore = create<LoginState>()(
  devtools(
    persist(
      (set) => ({
        loginstate: "admin",
        username:"",
        changeState: (by) => set((state) => ({ loginstate: by })),
        changeName: (by) => set((state) => ({ username: by })),
      }),
      { name: 'loginStore' }
    )
  )
)


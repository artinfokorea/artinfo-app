import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router } from "expo-router"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { authStore, AuthTokens, signOut as clearTokens } from "@/lib/auth-store"
import { queries } from "@/lib/queries"
import { USER } from "@/types/users"

type AuthContextValue = {
  /** SecureStore 에서 토큰을 읽어오기 전이면 false */
  isReady: boolean
  isLoggedIn: boolean
  user?: USER
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const [tokens, setTokens] = useState<AuthTokens | null>(authStore.get())
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const unsubscribe = authStore.subscribe(setTokens)
    authStore.load().finally(() => setIsReady(true))
    return unsubscribe
  }, [])

  const isLoggedIn = !!tokens

  const { data: user } = useQuery({
    ...queries.users.detail(),
    enabled: isLoggedIn,
  })

  useEffect(() => {
    if (!isLoggedIn) {
      queryClient.removeQueries({ queryKey: queries.users.detail().queryKey })
    }
  }, [isLoggedIn, queryClient])

  const signOut = useCallback(async () => {
    await clearTokens()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo(
    () => ({ isReady, isLoggedIn, user: isLoggedIn ? user : undefined, signOut }),
    [isReady, isLoggedIn, user, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside AuthProvider")
  return context
}

/**
 * 로그인이 필요한 동작 앞에서 호출한다. 로그인 상태가 아니면 로그인 화면으로 보내고 false 를 돌려준다.
 * (웹 middleware 가 /my-profile, /\*\/create 를 막는 것과 같은 역할)
 */
export const useRequireAuth = () => {
  const { isLoggedIn } = useAuth()
  return useCallback(() => {
    if (!isLoggedIn) {
      router.push("/auth/sign-in")
      return false
    }
    return true
  }, [isLoggedIn])
}

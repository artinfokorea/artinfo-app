import { router } from "expo-router"
import { useEffect } from "react"

import { useAuth } from "@/lib/auth"

/** 로그인이 필요한 화면(웹의 (private) 라우트)에서 로그아웃 상태면 로그인 화면으로 바꾼다. */
export const useSignInRedirect = () => {
  const { isReady, isLoggedIn } = useAuth()

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      router.replace("/auth/sign-in")
    }
  }, [isReady, isLoggedIn])

  return isReady && isLoggedIn
}

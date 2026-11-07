import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { router, Stack, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ActivityTracker } from "@/components/provider/ActivityTracker"
import { ToastProvider } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { AuthProvider, useAuth } from "@/lib/auth"

SplashScreen.preventAutoHideAsync()

/**
 * 로그인 정책 (앱 심사 지침 5.1.1): 채용·공연·뉴스·레슨·나눔 열람은 로그인 없이 가능하고,
 * 글쓰기·지원·댓글·좋아요·내 정보처럼 계정이 필요한 동작만 로그인을 요구한다(useRequireAuth / useSignInRedirect).
 * 여기서는 로그인 상태에서 인증 화면에 남아 있지 않도록만 처리하고, 토큰 판단이 끝나면 스플래시를 내린다.
 */
const AuthGate = () => {
  const { isReady, isLoggedIn } = useAuth()
  const segments = useSegments()
  const inAuthGroup = segments[0] === "auth"

  useEffect(() => {
    if (isReady && isLoggedIn && inAuthGroup) router.replace("/")
  }, [isReady, isLoggedIn, inAuthGroup])

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync()
  }, [isReady])

  return null
}

/** 로그인 후 푸시 토큰 등록·알림 탭 이동 (AuthProvider 안에서 실행) */
const PushNotifications = () => {
  usePushNotifications()
  return null
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      }),
  )

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <AuthGate />
              <ActivityTracker />
              <PushNotifications />
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerTintColor: colors.black,
                  headerBackButtonDisplayMode: "minimal",
                  headerShadowVisible: false,
                  // iOS 26 기본 헤더는 반투명이라 내용이 헤더 밑으로 들어간다 — 불투명 흰 헤더로 고정
                  headerStyle: { backgroundColor: colors.white },
                  headerTransparent: false,
                  contentStyle: { backgroundColor: colors.white },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="menu" options={{ presentation: "modal", title: "메뉴" }} />
                <Stack.Screen name="auth/sign-in" options={{ headerShown: false }} />
              </Stack>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Stack } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import React, { useEffect, useState } from "react"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"

import { ToastProvider } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { AuthProvider, useAuth } from "@/lib/auth"

SplashScreen.preventAutoHideAsync()

const HideSplashWhenReady = () => {
  const { isReady } = useAuth()
  useEffect(() => {
    if (isReady) SplashScreen.hideAsync()
  }, [isReady])
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
              <HideSplashWhenReady />
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerTintColor: colors.black,
                  headerBackButtonDisplayMode: "minimal",
                  headerShadowVisible: false,
                  contentStyle: { backgroundColor: colors.white },
                }}
              >
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="menu" options={{ presentation: "modal", title: "메뉴" }} />
              </Stack>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

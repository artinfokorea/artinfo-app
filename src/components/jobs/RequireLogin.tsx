import { router } from "expo-router"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

import { Button, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"

/** 웹 middleware 의 /*\/create 보호와 같은 역할: 비로그인이면 로그인 안내를 보여준다 */
export const RequireLogin = ({ children }: { children: React.ReactNode }) => {
  const { isReady, isLoggedIn } = useAuth()
  if (!isReady) return <Loading style={{ flex: 1 }} />
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>로그인이 필요합니다.</Text>
        <Button title="로그인" onPress={() => router.push("/auth/sign-in")} style={{ alignSelf: "stretch" }} />
      </View>
    )
  }
  return <>{children}</>
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 17, fontWeight: "700", color: colors.black },
})

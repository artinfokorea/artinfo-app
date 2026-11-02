import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

/** 웹 components/layouts/Header 의 모바일 모양: 왼쪽 ARTINFO 로고, 오른쪽 햄버거 메뉴 */
export const AppHeader = () => {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <View style={styles.inner}>
        <Pressable onPress={() => router.navigate("/")} hitSlop={8}>
          <Text style={styles.logo}>ARTINFO</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/menu")} hitSlop={10} accessibilityLabel="메뉴 열기">
          <Icon name="line.3.horizontal" size={26} color={colors.dimgray} />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  inner: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { fontSize: 24, fontWeight: "800", color: colors.main },
})

import * as WebBrowser from "expo-web-browser"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { PRIVACY_URL, TERMS_URL } from "@/constants/config"
import { colors } from "@/constants/theme"

/** 이용약관 · 개인정보처리방침 링크 — 메뉴 하단과 회원가입에서 쓴다 */
export const LegalLinks = ({ compact }: { compact?: boolean }) => (
  <View style={[styles.row, compact && { justifyContent: "flex-start" }]}>
    <Pressable onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)} hitSlop={6}>
      <Text style={styles.link}>이용약관</Text>
    </Pressable>
    <Text style={styles.divider}>|</Text>
    <Pressable onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)} hitSlop={6}>
      <Text style={styles.link}>개인정보처리방침</Text>
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  link: { fontSize: 13, color: colors.coolgray, textDecorationLine: "underline" },
  divider: { fontSize: 12, color: colors.gray300 },
})

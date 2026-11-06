import * as WebBrowser from "expo-web-browser"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

type Props = {
  checked: boolean
  onToggle: () => void
  label: string
  /** 눌러서 전문을 보는 링크 */
  url: string
}

/** 회원가입 필수 동의 — 약관 전문은 인앱 브라우저로 연다 */
export const ConsentCheckbox = ({ checked, onToggle, label, url }: Props) => (
  <View style={styles.row}>
    <Pressable onPress={onToggle} style={styles.toggle} hitSlop={8} accessibilityRole="checkbox" accessibilityState={{ checked }}>
      <Icon name={checked ? "checkmark.circle.fill" : "circle"} size={22} color={checked ? colors.main : colors.gray300} />
      <Text style={styles.label}>
        <Text style={styles.required}>[필수] </Text>
        {label}
      </Text>
    </Pressable>
    <Pressable onPress={() => WebBrowser.openBrowserAsync(url)} hitSlop={8}>
      <Text style={styles.view}>보기</Text>
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 },
  toggle: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  label: { fontSize: 14, color: colors.gray900, flexShrink: 1 },
  required: { color: colors.main, fontWeight: "700" },
  view: { fontSize: 13, color: colors.coolgray, textDecorationLine: "underline", marginLeft: 12 },
})

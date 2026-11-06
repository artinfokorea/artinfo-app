import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { colors } from "@/constants/theme"

type Props = {
  title: string
  /** 오른쪽 "+ 공고 등록" 같은 등록 링크 */
  action?: { label: string; onPress: () => void }
}

/** 웹 components/common/ListPageHeader + CreateButton — 목록 페이지 상단 제목과 등록 링크 */
export const ListPageHeader = ({ title, action }: Props) => (
  <View style={styles.row}>
    <Text style={styles.title}>{title}</Text>
    {action ? (
      <Pressable onPress={action.onPress} hitSlop={8} accessibilityRole="button">
        <Text style={styles.action}>+ {action.label}</Text>
      </Pressable>
    ) : null}
  </View>
)

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: { fontSize: 24, fontWeight: "700", color: colors.ink, letterSpacing: -0.3 },
  action: { fontSize: 14, fontWeight: "700", color: colors.main, paddingVertical: 10 },
})

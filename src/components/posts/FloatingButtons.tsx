import React from "react"
import { Pressable, StyleSheet, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

type Props = {
  onScrollTop?: () => void
  /** 없으면 + 버튼을 숨긴다 */
  onAdd?: () => void
}

/** 웹 목록 화면 오른쪽 아래의 맨 위로(ArrowUpButton) + 글쓰기(AddButton) 버튼 */
export const FloatingButtons = ({ onScrollTop, onAdd }: Props) => (
  <View style={styles.container} pointerEvents="box-none">
    {onScrollTop ? (
      <Pressable style={styles.button} onPress={onScrollTop} accessibilityLabel="맨 위로">
        <Icon name="arrow.up" size={18} color={colors.gray600} />
      </Pressable>
    ) : null}
    {onAdd ? (
      <Pressable style={styles.button} onPress={onAdd} accessibilityLabel="글쓰기">
        <Icon name="plus" size={20} color={colors.main} weight="semibold" />
      </Pressable>
    ) : null}
  </View>
)

const styles = StyleSheet.create({
  container: { position: "absolute", right: 16, bottom: 24, gap: 12 },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
})

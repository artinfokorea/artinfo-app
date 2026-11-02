import React from "react"
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

type Props = {
  onEdit: () => void
  onDelete: () => void
  style?: StyleProp<ViewStyle>
}

/** 웹 components/common/ItemManageBox — 수정/삭제 아이콘 버튼 */
export const ItemManageBox = ({ onEdit, onDelete, style }: Props) => (
  <View style={[{ flexDirection: "row", gap: 8 }, style]}>
    <Pressable style={styles.button} onPress={onEdit} accessibilityLabel="수정">
      <Icon name="square.and.pencil" size={18} color={colors.gray700} />
    </Pressable>
    <Pressable style={styles.button} onPress={onDelete} accessibilityLabel="삭제">
      <Icon name="trash" size={18} color={colors.gray700} />
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    borderRadius: 8,
    padding: 8,
  },
})

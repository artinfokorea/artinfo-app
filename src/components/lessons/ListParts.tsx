import React from "react"
import { Alert, Pressable, StyleSheet, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

/** 웹 components/common/ItemManageBox: 수정 / 삭제 아이콘 버튼 */
export const ItemManageBox = ({
  onEdit,
  onDelete,
  deleteTitle,
  deleteMessage,
}: {
  onEdit: () => void
  onDelete: () => void
  deleteTitle: string
  deleteMessage: string
}) => (
  <View style={{ flexDirection: "row", gap: 8 }}>
    <Pressable style={styles.manageButton} onPress={onEdit} accessibilityLabel="수정">
      <Icon name="pencil" size={18} color={colors.gray700} />
    </Pressable>
    <Pressable
      style={styles.manageButton}
      accessibilityLabel="삭제"
      onPress={() =>
        Alert.alert(deleteTitle, deleteMessage, [
          { text: "취소", style: "cancel" },
          { text: "삭제", style: "destructive", onPress: onDelete },
        ])
      }
    >
      <Icon name="trash" size={18} color={colors.gray700} />
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  manageButton: {
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    borderRadius: 8,
    padding: 8,
  },
})

/** 2열 그리드에서 마지막 줄 아이템이 혼자 꽉 차지 않도록 빈 칸을 채운다. */
export function padGrid<T>(items: T[], columns = 2): (T | null)[] {
  const rest = items.length % columns
  return rest === 0 ? items : [...items, ...Array(columns - rest).fill(null)]
}

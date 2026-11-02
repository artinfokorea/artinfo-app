import React from "react"
import { Alert, Pressable, StyleSheet, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

type Props = {
  onEdit: () => void
  onDelete: () => void
  /** 삭제 확인 창 제목/설명 (웹 ConfirmDialog) */
  deleteTitle: string
  deleteDescription: string
}

/** 웹 components/common/ItemManageBox: 수정/삭제 버튼. 삭제는 확인 후 실행 */
export const ItemManageBox = ({ onEdit, onDelete, deleteTitle, deleteDescription }: Props) => (
  <View style={styles.row}>
    <Pressable onPress={onEdit} style={styles.button} accessibilityLabel="수정">
      <Icon name="square.and.pencil" size={18} color={colors.gray700} />
    </Pressable>
    <Pressable
      onPress={() =>
        Alert.alert(deleteTitle, deleteDescription, [
          { text: "취소", style: "cancel" },
          { text: "삭제", style: "destructive", onPress: onDelete },
        ])
      }
      style={styles.button}
      accessibilityLabel="삭제"
    >
      <Icon name="trash" size={18} color={colors.gray700} />
    </Pressable>
  </View>
)

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  button: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    alignItems: "center",
    justifyContent: "center",
  },
})

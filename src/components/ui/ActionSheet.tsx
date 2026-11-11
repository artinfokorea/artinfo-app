import React, { useEffect, useState } from "react"
import { Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors } from "@/constants/theme"
import { ActionSheetRequest, setActionSheetListener } from "@/lib/action-sheet"

/**
 * Android 용 선택 메뉴(하단 시트). 루트 레이아웃에 한 번 마운트하면 lib/action-sheet 의 showActionSheet 가 여기로 띄운다.
 * iOS 는 시스템 ActionSheetIOS 를 쓰므로 아무것도 그리지 않는다.
 */
export const ActionSheetHost = () => {
  const insets = useSafeAreaInsets()
  const [request, setRequest] = useState<ActionSheetRequest | null>(null)

  useEffect(() => {
    if (Platform.OS === "ios") return
    setActionSheetListener(setRequest)
    return () => setActionSheetListener(null)
  }, [])

  if (Platform.OS === "ios" || !request) return null

  const { options, cancelButtonIndex, destructiveButtonIndex, title, onSelect } = request
  const cancelIndex = cancelButtonIndex ?? -1
  const items = options.map((label, index) => ({ label, index })).filter(item => item.index !== cancelIndex)

  const close = (index: number) => {
    setRequest(null)
    onSelect(index)
  }

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent navigationBarTranslucent onRequestClose={() => close(cancelIndex)}>
      <Pressable style={styles.backdrop} onPress={() => close(cancelIndex)} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {items.map(item => (
          <Pressable
            key={item.index}
            onPress={() => close(item.index)}
            android_ripple={{ color: colors.gray100 }}
            style={styles.item}
            accessibilityRole="button"
          >
            <Text style={[styles.label, item.index === destructiveButtonIndex && { color: colors.error }]}>{item.label}</Text>
          </Pressable>
        ))}
        {cancelIndex >= 0 ? (
          <Pressable onPress={() => close(cancelIndex)} android_ripple={{ color: colors.gray100 }} style={[styles.item, styles.cancel]}>
            <Text style={[styles.label, { color: colors.gray500 }]}>{options[cancelIndex]}</Text>
          </Pressable>
        ) : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
  },
  title: { fontSize: 13, color: colors.gray500, textAlign: "center", paddingVertical: 12 },
  item: { paddingVertical: 16, paddingHorizontal: 20 },
  cancel: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.gray200, marginTop: 4 },
  label: { fontSize: 16, color: colors.black, textAlign: "center" },
})

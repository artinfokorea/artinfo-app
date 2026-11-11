import React, { useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"

export type SelectOption<V> = { label: string; value: V; indent?: boolean }

type Props<V> = {
  visible: boolean
  title: string
  options: SelectOption<V>[]
  /** 선택된 값들 */
  selected: V[]
  multiple?: boolean
  /** 최대 선택 개수 (multiple 일 때) */
  max?: number
  onClose: () => void
  onConfirm: (values: V[]) => void
}

/**
 * 하단 시트 형태의 선택 다이얼로그. 웹의 ProvinceDialog / MajorDialog / 모바일 필터 탭 등을 대신한다.
 */
export function SelectSheet<V>({
  visible,
  title,
  options,
  selected,
  multiple = false,
  max,
  onClose,
  onConfirm,
}: Props<V>) {
  const insets = useSafeAreaInsets()
  const [draft, setDraft] = useState<V[]>(selected)

  // 열릴 때마다 현재 선택값으로 초안을 맞춘다 (렌더 중 prop 변화 반영 패턴)
  const [prevVisible, setPrevVisible] = useState(visible)
  if (visible !== prevVisible) {
    setPrevVisible(visible)
    if (visible) setDraft(selected)
  }

  const toggle = (value: V) => {
    if (!multiple) {
      onConfirm([value])
      onClose()
      return
    }
    setDraft(prev => {
      if (prev.includes(value)) return prev.filter(v => v !== value)
      if (max && prev.length >= max) return prev
      return [...prev, value]
    })
  }

  return (
    <Modal statusBarTranslucent navigationBarTranslucent visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Icon name="xmark" size={18} color={colors.gray500} />
          </Pressable>
        </View>
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingVertical: 4 }}>
          {options.map(option => {
            const isSelected = (multiple ? draft : selected).includes(option.value)
            return (
              <Pressable
                key={String(option.value)}
                onPress={() => toggle(option.value)}
                style={[styles.row, option.indent && { paddingLeft: 32 }]}
              >
                <Text style={[styles.rowText, isSelected && { color: colors.main, fontWeight: "700" }]}>
                  {option.label}
                </Text>
                {isSelected ? <Icon name="checkmark" size={16} color={colors.main} weight="bold" /> : null}
              </Pressable>
            )
          })}
        </ScrollView>
        {multiple ? (
          <View style={{ flexDirection: "row", gap: 8, paddingTop: 12 }}>
            <Button title="초기화" variant="muted" style={{ flex: 1 }} onPress={() => setDraft([])} />
            <Button
              title="적용"
              style={{ flex: 2 }}
              onPress={() => {
                onConfirm(draft)
                onClose()
              }}
            />
          </View>
        ) : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.black },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  rowText: { fontSize: 16, color: colors.gray800 },
})

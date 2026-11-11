import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { MAJOR } from "@/types/majors"

type Props = {
  visible: boolean
  onClose: () => void
  selectedMajors: MAJOR[]
  onToggle: (major: MAJOR) => void
  multiple?: boolean
  max?: number
}

/** 웹 components/dialog/MajorDialog: 분야(secondGroup)별로 묶은 전공 칩 선택 */
export const MajorSelectSheet = ({ visible, onClose, selectedMajors, onToggle, multiple = true, max }: Props) => {
  const insets = useSafeAreaInsets()
  const { data } = useQuery(queries.majors.list())

  const groups = useMemo(() => {
    const map = new Map<string, { label: string; majors: MAJOR[] }>()
    data?.majors?.forEach(major => {
      const group = map.get(major.secondGroupEn) ?? { label: major.secondGroupKo, majors: [] }
      group.majors.push(major)
      map.set(major.secondGroupEn, group)
    })
    return Array.from(map.values())
  }, [data])

  const selectedIds = selectedMajors.map(major => major.id)

  const select = (major: MAJOR) => {
    const isSelected = selectedIds.includes(major.id)
    if (!isSelected && max && selectedMajors.length >= max) return
    onToggle(major)
    if (!multiple) onClose()
  }

  return (
    <Modal statusBarTranslucent navigationBarTranslucent visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>전공선택</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Icon name="xmark" size={18} color={colors.silver} />
          </Pressable>
        </View>
        {max ? <Text style={styles.hint}>전공은 최대 {max}개까지 선택 가능합니다.</Text> : null}
        <ScrollView style={{ maxHeight: 460 }}>
          {groups.map(group => (
            <View key={group.label} style={{ marginVertical: 10, gap: 10 }}>
              <Text style={styles.groupLabel}>{group.label}</Text>
              <View style={styles.chips}>
                {group.majors.map(major => {
                  const selected = selectedIds.includes(major.id)
                  return (
                    <Pressable
                      key={major.id}
                      onPress={() => select(major)}
                      style={[styles.chip, { backgroundColor: selected ? colors.main : colors.lavender }]}
                    >
                      <Text style={styles.chipText}>{major.koName}</Text>
                    </Pressable>
                  )
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        {multiple ? <Button title="선택 완료" onPress={onClose} style={{ marginTop: 12 }} /> : null}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: colors.black },
  hint: { fontSize: 13, color: colors.silver, marginTop: 4 },
  groupLabel: { fontWeight: "700", color: colors.coolgray },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { color: colors.white, fontSize: 14, fontWeight: "500" },
})

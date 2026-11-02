import { useQuery } from "@tanstack/react-query"
import React, { useMemo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { DialogSheet } from "@/components/profile/DialogSheet"
import { Button, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { MAJOR } from "@/types/majors"

type Props = {
  visible: boolean
  onClose: () => void
  selectedMajors: MAJOR[]
  onSelectMajor: (major: MAJOR) => void
  multiple?: boolean
}

/** 웹 components/dialog/MajorDialog — 분야(secondGroup)별로 묶인 전공 칩 */
export const MajorSheet = ({ visible, onClose, selectedMajors, onSelectMajor, multiple }: Props) => {
  const { data, isLoading } = useQuery({ ...queries.majors.list(), enabled: visible })

  const categories = useMemo(() => {
    const groups = new Map<string, { label: string; majors: MAJOR[] }>()
    data?.majors.forEach(major => {
      const group = groups.get(major.secondGroupEn) ?? { label: major.secondGroupKo, majors: [] }
      group.majors.push(major)
      groups.set(major.secondGroupEn, group)
    })
    return Array.from(groups.entries())
  }, [data])

  const selectedIds = selectedMajors.map(major => major.id)

  const select = (major: MAJOR) => {
    onSelectMajor(major)
    if (!multiple) onClose()
  }

  return (
    <DialogSheet
      visible={visible}
      title="전공선택"
      onClose={onClose}
      footer={multiple ? <Button title="선택 완료" onPress={onClose} /> : undefined}
    >
      {isLoading ? <Loading /> : null}
      {categories.map(([key, group]) => (
        <View key={key} style={{ gap: 10 }}>
          <Text style={styles.groupTitle}>{group.label}</Text>
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
    </DialogSheet>
  )
}

const styles = StyleSheet.create({
  groupTitle: { fontWeight: "700", color: colors.coolgray },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 5 },
  chipText: { color: colors.white, fontSize: 14 },
})

import React, { useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/ui/Icon"
import { SearchBar } from "@/components/ui/SearchBar"
import { colors } from "@/constants/theme"

export type FilterOption = { label: string; value: string }

export type FilterGroup = {
  /** 선택값을 담는 키 (웹의 URL 파라미터 이름: provinceId, recruit …) */
  param: string
  name: string
  options: FilterOption[]
  /** API 가 값 하나만 받는 경우 */
  single?: boolean
}

/** param → 고른 값 목록 */
export type FilterSelection = Record<string, string[]>

type Props = {
  searchPlaceholder: string
  keyword: string
  onKeywordChange: (keyword: string) => void
  groups?: FilterGroup[]
  selected?: FilterSelection
  onSelectedChange?: (next: FilterSelection) => void
}

/**
 * 웹 components/common/ListToolbar — 목록 페이지 공용 도구줄: 검색창 + 필터 버튼.
 * 필터는 하단 시트로 열리고, 고른 값은 검색창 아래에 지울 수 있는 칩으로 남는다.
 */
export const ListToolbar = ({
  searchPlaceholder,
  keyword,
  onKeywordChange,
  groups = [],
  selected = {},
  onSelectedChange,
}: Props) => {
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)

  const pick = (param: string) => selected[param] ?? []

  const toggle = (group: FilterGroup, value: string) => {
    const current = pick(group.param)
    const next = current.includes(value)
      ? current.filter(v => v !== value)
      : group.single
        ? [value]
        : [...current, value]
    onSelectedChange?.({ ...selected, [group.param]: next })
  }

  const reset = () => {
    const next = { ...selected }
    groups.forEach(group => delete next[group.param])
    onSelectedChange?.(next)
  }

  const pills = groups.flatMap(group =>
    pick(group.param)
      .map(value => {
        const option = group.options.find(o => o.value === value)
        return option ? { group, option } : null
      })
      .filter((pill): pill is { group: FilterGroup; option: FilterOption } => !!pill),
  )

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <SearchBar value={keyword} onSubmit={onKeywordChange} placeholder={searchPlaceholder} />
        </View>
        {groups.length > 0 ? (
          <Pressable
            onPress={() => setOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={pills.length ? `필터 ${pills.length}개 선택됨` : "필터"}
            style={[styles.filterButton, pills.length > 0 && styles.filterButtonActive]}
          >
            <Icon
              name="line.3.horizontal.decrease"
              size={18}
              color={pills.length ? colors.ink : colors.ink3}
              weight={pills.length ? "semibold" : "regular"}
            />
            {pills.length > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pills.length}</Text>
              </View>
            ) : null}
          </Pressable>
        ) : null}
      </View>

      {pills.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pills}
          contentContainerStyle={{ gap: 6, paddingHorizontal: 16 }}
        >
          {pills.map(({ group, option }) => (
            <Pressable
              key={`${group.param}-${option.value}`}
              onPress={() => toggle(group, option.value)}
              accessibilityLabel={`${option.label} 필터 해제`}
              style={styles.pill}
            >
              <Text style={styles.pillText}>{option.label}</Text>
              <Icon name="xmark" size={11} color={colors.coolgray} />
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="필터 닫기" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>필터</Text>
            <Pressable onPress={reset} hitSlop={8}>
              <Text style={styles.resetText}>초기화</Text>
            </Pressable>
          </View>
          <ScrollView style={{ maxHeight: 440 }} contentContainerStyle={{ gap: 20 }}>
            {groups.map(group => (
              <View key={group.param} style={{ gap: 10 }}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={styles.chips}>
                  {group.options.map(option => {
                    const active = pick(group.param).includes(option.value)
                    return (
                      <Pressable
                        key={option.value}
                        onPress={() => toggle(group, option.value)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
                      </Pressable>
                    )
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
          <Pressable style={styles.applyButton} onPress={() => setOpen(false)} accessibilityRole="button">
            <Text style={styles.applyText}>결과 보기</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 16 },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: { borderColor: colors.ink },
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: colors.white, fontSize: 11, fontWeight: "700" },
  pills: { marginTop: 12, flexGrow: 0 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 30,
    borderRadius: 15,
    paddingLeft: 12,
    paddingRight: 8,
    backgroundColor: colors.surface,
  },
  pillText: { fontSize: 13, color: colors.ink2 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  handle: { alignSelf: "center", width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sheetTitle: { fontSize: 18, fontWeight: "700", color: colors.ink },
  resetText: { fontSize: 14, color: colors.muted, paddingVertical: 8 },
  groupName: { fontSize: 13, fontWeight: "700", color: colors.muted },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { borderColor: colors.main, backgroundColor: colors.tagBg },
  chipText: { fontSize: 14, color: colors.ink3 },
  chipTextActive: { color: colors.main, fontWeight: "700" },
  applyButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: { color: colors.white, fontSize: 16, fontWeight: "700" },
})

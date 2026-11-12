import { useQuery } from "@tanstack/react-query"
import React, { useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { Chip } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { MAJOR } from "@/types/majors"

type Props = {
  selected: MAJOR[]
  onToggle: (major: MAJOR) => void
}

/**
 * 모집 전공 선택 — 시트 없이 폼 안에서 바로 고른다 (웹 components/jobs/MajorChipPicker 와 같은 구성).
 * 전공이 57개라 분류(클래식·실용음악·국악·미술·사무) 탭으로 나누고, 고른 전공은 탭과 무관하게 위에 모아 보여 준다.
 */
export const MajorChipPicker = ({ selected, onToggle }: Props) => {
  const { data } = useQuery(queries.majors.list())
  const groups = useMemo(() => {
    const map = new Map<string, MAJOR[]>()
    data?.majors?.forEach(major => {
      const list = map.get(major.secondGroupKo) ?? []
      list.push(major)
      map.set(major.secondGroupKo, list)
    })
    return Array.from(map.entries())
  }, [data])
  const [group, setGroup] = useState<string | null>(null)
  const activeGroup = group ?? groups[0]?.[0] ?? null
  const selectedIds = new Set(selected.map(major => major.id))

  return (
    <View style={{ gap: 10 }}>
      {selected.length > 0 ? (
        <View style={styles.chips}>
          {selected.map(major => (
            <Chip key={major.id} label={`${major.koName} ×`} selected onPress={() => onToggle(major)} />
          ))}
        </View>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {groups.map(([name, list]) => {
          const picked = list.filter(major => selectedIds.has(major.id)).length
          const on = name === activeGroup
          return (
            <Pressable key={name} onPress={() => setGroup(name)} style={[styles.tab, on && styles.tabOn]} accessibilityRole="tab" accessibilityState={{ selected: on }}>
              <Text style={[styles.tabText, on && styles.tabTextOn]}>
                {name}
                {picked > 0 ? <Text style={styles.tabCount}> {picked}</Text> : null}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>
      <View style={styles.chips}>
        {(groups.find(([name]) => name === activeGroup)?.[1] ?? []).map(major => (
          <Chip key={major.id} label={major.koName} selected={selectedIds.has(major.id)} onPress={() => onToggle(major)} />
        ))}
        {groups.length === 0 ? <Text style={styles.loading}>전공 목록을 불러오는 중…</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tabs: { flexDirection: "row", gap: 4, backgroundColor: colors.surface2, borderRadius: 12, padding: 4 },
  tab: { height: 34, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" },
  tabOn: { backgroundColor: colors.white, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  tabText: { fontSize: 13, fontWeight: "600", color: colors.muted },
  tabTextOn: { color: colors.ink, fontWeight: "700" },
  tabCount: { fontSize: 12, color: colors.tagText },
  loading: { fontSize: 13, color: colors.coolgray },
})

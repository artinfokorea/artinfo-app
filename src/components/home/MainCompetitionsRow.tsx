import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React from "react"
import { FlatList, StyleSheet, Text, View } from "react-native"

import { CompetitionCard } from "@/components/competitions/CompetitionCard"
import { SectionHeader } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"

export const MAIN_COMPETITIONS_REQUEST = { page: 1, size: 5 }

/** 홈 '콩쿠르 NEW' — 공연 줄과 같은 포스터 가로 줄, 마감 가까운 5건. 0건이거나 못 받으면 숨긴다 (웹 MainCompetitionsContainer) */
export const MainCompetitionsRow = () => {
  const { data } = useQuery(queries.competitions.list(MAIN_COMPETITIONS_REQUEST))
  const competitions = data?.competitions ?? []
  if (competitions.length === 0) return null

  return (
    <View style={styles.section}>
      <SectionHeader
        title="콩쿠르"
        icon={
          <View style={styles.newBadge}>
            <Text style={styles.newText}>NEW</Text>
          </View>
        }
        onMore={() => router.navigate({ pathname: "/community", params: { tab: "competitions" } })}
      />
      <FlatList
        data={competitions}
        keyExtractor={c => String(c.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={({ item }) => <CompetitionCard competition={item} width={150} compact />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginVertical: 24 },
  newBadge: { backgroundColor: colors.main, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  newText: { color: colors.white, fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
})

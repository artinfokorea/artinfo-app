import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { PERFORMANCE } from "@/types/performances"

const filter = filters()

/** 웹 components/performances/PerformanceCard — 3:4 포스터, 제목·기간은 왼쪽 정렬 */
export const PerformanceCard = ({ performance }: { performance: PERFORMANCE }) => (
  <Pressable style={styles.card} onPress={() => router.push(`/performances/${performance.id}`)}>
    <View style={styles.poster}>
      <FallbackImage src={performance.posterImageUrl} style={StyleSheet.absoluteFill} />
    </View>
    <View style={{ gap: 4 }}>
      <Text style={styles.title} numberOfLines={2}>
        {performance.title}
      </Text>
      <Text style={styles.period}>
        {`${filter.YYYYMMDD(performance.startAt)} ~ ${filter.YYYYMMDD(performance.endAt)}`}
      </Text>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  card: { flex: 1, gap: 10 },
  poster: {
    aspectRatio: 3 / 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line2,
    overflow: "hidden",
    backgroundColor: colors.surface2,
  },
  title: { fontSize: 15, fontWeight: "700", color: colors.ink, lineHeight: 20 },
  period: { fontSize: 13, color: colors.muted },
})

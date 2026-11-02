import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { PERFORMANCE } from "@/types/performances"

const filter = filters()

/** 웹 components/performances/PerformanceCard: 3:4 포스터 + 제목 + 기간 */
export const PerformanceCard = ({ performance }: { performance: PERFORMANCE }) => (
  <Pressable style={{ flex: 1 }} onPress={() => router.push(`/performances/${performance.id}`)}>
    <View style={styles.poster}>
      <FallbackImage src={performance.posterImageUrl} style={StyleSheet.absoluteFill} />
    </View>
    <View style={styles.info}>
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
  poster: {
    aspectRatio: 3 / 4,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: colors.gray100,
  },
  info: { marginTop: 12, marginBottom: 8, alignItems: "center", gap: 8 },
  title: { fontSize: 13, fontWeight: "700", textAlign: "center", color: colors.black },
  period: { fontSize: 11, color: colors.grayfont },
})

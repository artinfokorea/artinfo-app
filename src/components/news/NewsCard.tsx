import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { NEWS } from "@/types/news"

const filter = filters()

/** 웹 components/news/NewsCard (모바일) — 왼쪽 썸네일(27:17) + 제목 2줄 + 날짜 */
export const NewsCard = ({ news }: { news: NEWS }) => (
  <Pressable
    onPress={() => router.push(`/news/${news.id}`)}
    style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surface2 }]}
  >
    <View style={styles.thumb}>
      <FallbackImage src={news.thumbnailImageUrl} style={StyleSheet.absoluteFill} />
    </View>
    <View style={styles.body}>
      <Text style={styles.title} numberOfLines={2}>
        {news.title}
      </Text>
      <Text style={styles.date}>{filter.YYYYMMDD(news.createdAt)}</Text>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 14, paddingHorizontal: 16, paddingVertical: 16 },
  thumb: {
    width: 120,
    aspectRatio: 27 / 17,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line2,
    backgroundColor: colors.surface2,
    overflow: "hidden",
  },
  body: { flex: 1, minWidth: 0, gap: 6 },
  title: { fontSize: 15, fontWeight: "700", color: colors.ink, lineHeight: 20 },
  date: { fontSize: 13, color: colors.coolgray },
})

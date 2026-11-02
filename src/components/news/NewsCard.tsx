import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { NEWS } from "@/types/news"

const filter = filters()

/** 웹 components/news/NewsCard (모바일: 이미지 위, 텍스트 아래) */
export const NewsCard = ({ news }: { news: NEWS }) => (
  <Pressable
    onPress={() => router.push(`/news/${news.id}`)}
    style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.whitesmoke }]}
  >
    <FallbackImage src={news.thumbnailImageUrl} style={styles.image} />
    <View style={{ gap: 16 }}>
      <Text style={styles.title} numberOfLines={2}>
        {news.title}
      </Text>
      <Text style={styles.summary} numberOfLines={4}>
        {news.summary?.trim()}
      </Text>
      <Text style={styles.date}>{filter.YYYYMMDD(news.createdAt)}</Text>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  card: { padding: 16, gap: 32, borderRadius: 6 },
  image: { width: "100%", aspectRatio: 27 / 17, borderRadius: 8 },
  title: { fontSize: 20, letterSpacing: 0.5, color: colors.black },
  summary: { fontSize: 14, lineHeight: 28, letterSpacing: 0.3, color: colors.coolgray },
  date: { fontSize: 14, color: colors.coolgray },
})

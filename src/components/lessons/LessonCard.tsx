import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import { LESSON } from "@/types/lessons"

/** 웹 components/lessons/LessonCard — 세로 사진(20:27) 아래에 이름 · 전공 칩 · 지역 */
export const LessonCard = ({ lesson }: { lesson: LESSON }) => {
  const [provinceName, areaName] = (lesson.area ?? "").split(" ")
  const location = [provinceName?.substring(0, 2), areaName].filter(Boolean).join(" ")

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/lessons/${lesson.id}`)}>
      <View style={styles.imageBox}>
        <FallbackImage src={lesson.imageUrl} style={StyleSheet.absoluteFill} />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={styles.name} numberOfLines={1}>
          {lesson.name}
        </Text>
        <View style={styles.metaRow}>
          {lesson.major ? (
            <View style={styles.majorChip}>
              <Text style={styles.majorText} numberOfLines={1}>
                {lesson.major}
              </Text>
            </View>
          ) : null}
          {location ? (
            <Text style={styles.location} numberOfLines={1}>
              {location}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1, gap: 10 },
  imageBox: {
    aspectRatio: 20 / 27,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line2,
    overflow: "hidden",
    backgroundColor: colors.surface2,
  },
  name: { fontSize: 15, fontWeight: "700", color: colors.ink },
  metaRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 },
  majorChip: {
    height: 24,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: colors.tagBg,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 1,
  },
  majorText: { fontSize: 12, fontWeight: "500", color: colors.tagText },
  location: { fontSize: 13, color: colors.muted, flexShrink: 1 },
})

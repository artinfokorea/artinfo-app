import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import { LESSON } from "@/types/lessons"

/** 웹 components/lessons/LessonCard: 20:27 사진 위 오른쪽 아래에 이름 · 전공 · 지역 */
export const LessonCard = ({ lesson }: { lesson: LESSON }) => {
  const [provinceName, areaName] = (lesson.area ?? "").split(" ")
  const province = provinceName?.substring(0, 2)

  return (
    <Pressable style={styles.card} onPress={() => router.push(`/lessons/${lesson.id}`)}>
      <View style={styles.imageBox}>
        <FallbackImage src={lesson.imageUrl} style={StyleSheet.absoluteFill} />
        <View style={styles.shade} />
        <View style={styles.caption}>
          <Text style={styles.captionText} numberOfLines={1}>
            {lesson.name}
          </Text>
          <View style={styles.captionRow}>
            <Text style={styles.captionText} numberOfLines={1}>
              {lesson.major}
            </Text>
            <Text style={styles.captionText} numberOfLines={1}>
              {[province, areaName].filter(Boolean).join(" ")}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  imageBox: {
    aspectRatio: 20 / 27,
    borderRadius: 4,
    borderBottomLeftRadius: 24,
    overflow: "hidden",
    backgroundColor: colors.gray100,
  },
  shade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "40%",
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  caption: { position: "absolute", right: 12, bottom: 12, left: 12, alignItems: "flex-end" },
  captionRow: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  captionText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowRadius: 3,
  },
})

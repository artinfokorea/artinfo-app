import { Image } from "expo-image"
import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { colors } from "@/constants/theme"

/** 웹 components/main/LessonBanner (모바일) */
export const LessonBanner = () => (
  <View style={styles.box}>
    <View style={{ gap: 8, flex: 1 }}>
      <Text style={styles.title}>
        많은 학생들이 레슨 받으려고{"\n"}기다리고 있어요.
      </Text>
      <Pressable onPress={() => router.push("/lessons/create")} hitSlop={6}>
        <Text style={styles.link}>레슨 등록하기</Text>
      </Pressable>
    </View>
    <Image source={require("@/assets/images/instruments.png")} style={styles.image} contentFit="contain" />
  </View>
)

const styles = StyleSheet.create({
  box: {
    height: 100,
    borderRadius: 12,
    backgroundColor: colors.whitesmoke,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginVertical: 24,
    overflow: "hidden",
  },
  title: { fontSize: 14, fontWeight: "500", color: colors.gray900, lineHeight: 20 },
  link: { fontSize: 14, fontWeight: "700", color: colors.main },
  image: { width: 128, height: 128 },
})

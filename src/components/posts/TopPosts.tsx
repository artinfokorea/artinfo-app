import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { colors } from "@/constants/theme"
import { Post } from "@/types/posts"

/** 웹 components/posts/TopPosts — 목록 위 "인기 글" 작은 박스 (최대 6개) */
export const TopPosts = ({ posts }: { posts?: Post[] }) => {
  if (!posts || posts.length === 0) return null

  return (
    <View style={styles.box} accessibilityLabel="인기 글">
      <Text style={styles.heading}>인기 글</Text>
      <View style={{ marginTop: 8 }}>
        {posts.slice(0, 6).map((post, index) => (
          <Pressable key={post.id} style={styles.row} onPress={() => router.push(`/posts/${post.id}`)}>
            <Text style={styles.rank}>{index + 1}</Text>
            <Text style={styles.title} numberOfLines={1}>
              {post.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    marginTop: 24,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.surface2,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  heading: { fontSize: 14, fontWeight: "700", color: colors.ink },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
  rank: { width: 16, fontSize: 14, fontWeight: "700", color: colors.main },
  title: { flex: 1, fontSize: 14, color: colors.ink2 },
})

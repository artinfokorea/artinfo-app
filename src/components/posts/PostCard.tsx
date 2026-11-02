import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { PostThumbsUpButton } from "@/components/posts/PostThumbsUpButton"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { Post, PostCategoryLabel } from "@/types/posts"

const filter = filters()

/** HTML 본문에서 텍스트만 뽑아 40자로 자른다 (웹 PostCard.extractTextFromHtml) */
export const extractTextFromHtml = (html?: string, max = 40) => {
  const text = (html ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
  return text.slice(0, max) + (text.length > max ? "..." : "")
}

/** 웹 components/posts/PostCard */
export const PostCard = ({ post }: { post: Post }) => (
  <Pressable
    onPress={() => router.push(`/posts/${post.id}`)}
    style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.gray50 }]}
  >
    <Text style={styles.category}>{PostCategoryLabel[post.category]}</Text>
    <View style={styles.body}>
      <View style={{ flex: 1, gap: 6 }}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.preview} numberOfLines={2}>
          {extractTextFromHtml(post.contents)}
        </Text>
      </View>
      {post.thumbnailImageUrl ? (
        <FallbackImage src={post.thumbnailImageUrl} style={styles.thumbnail} />
      ) : null}
    </View>
    <Text style={styles.author}>{post.authorName}</Text>
    <View style={styles.footer}>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Icon name="eye" size={15} color={colors.gray400} />
          <Text style={styles.statText}>{post.viewCount}</Text>
        </View>
        <PostThumbsUpButton postId={post.id} isLiked={post.isLiked} likeCount={post.likeCount} />
        <View style={styles.stat}>
          <Icon name="message" size={14} color={colors.gray400} />
          <Text style={styles.statText}>{post.commentCount}</Text>
        </View>
      </View>
      <Text style={styles.date}>{filter.FROM_NOW_COMMENT(post.createdAt)}</Text>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  card: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray300,
    gap: 6,
  },
  category: { fontSize: 12, fontWeight: "300", color: colors.gray800 },
  body: { flexDirection: "row", alignItems: "center", gap: 12 },
  title: { fontSize: 16, color: colors.black },
  preview: { fontSize: 13, fontWeight: "300", color: colors.gray600 },
  thumbnail: { width: 64, height: 64, borderRadius: 10 },
  author: { fontSize: 12, fontWeight: "300", color: colors.gray800 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stats: { flexDirection: "row", alignItems: "center", gap: 20 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 14, color: colors.gray400 },
  date: { fontSize: 12, color: colors.gray400 },
})

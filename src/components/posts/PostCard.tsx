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

/** HTML 본문에서 텍스트만 뽑는다 (웹 PostCard.extractText). 두 줄 미리보기면 충분해서 적당히 자른다 */
export const extractTextFromHtml = (html?: string, max = 160) => {
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
  return text.slice(0, max)
}

/** 웹 components/posts/PostCard — 카테고리·제목·본문 미리보기·메타, 오른쪽 정사각 썸네일 */
export const PostCard = ({ post }: { post: Post }) => (
  <Pressable
    onPress={() => router.push(`/posts/${post.id}`)}
    style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surface2 }]}
  >
    <View style={styles.body}>
      <Text style={styles.category}>{PostCategoryLabel[post.category]}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      <Text style={styles.preview} numberOfLines={2}>
        {extractTextFromHtml(post.contents)}
      </Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta} numberOfLines={1}>
          {post.authorName} · {filter.FROM_NOW_COMMENT(post.createdAt)}
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Icon name="eye" size={15} color={colors.coolgray} />
            <Text style={styles.statText}>{post.viewCount}</Text>
          </View>
          <PostThumbsUpButton
            postId={post.id}
            isLiked={post.isLiked}
            likeCount={post.likeCount}
            textColor={colors.coolgray}
          />
          <View style={styles.stat}>
            <Icon name="message" size={14} color={colors.coolgray} />
            <Text style={styles.statText}>{post.commentCount}</Text>
          </View>
        </View>
      </View>
    </View>
    {post.thumbnailImageUrl ? (
      <View style={styles.thumbBox}>
        <FallbackImage src={post.thumbnailImageUrl} style={StyleSheet.absoluteFill} />
      </View>
    ) : null}
  </Pressable>
)

const styles = StyleSheet.create({
  card: { flexDirection: "row", gap: 16, paddingHorizontal: 16, paddingVertical: 16 },
  body: { flex: 1, minWidth: 0, gap: 6 },
  category: { fontSize: 12, fontWeight: "700", color: colors.main },
  title: { fontSize: 15, fontWeight: "700", color: colors.ink, lineHeight: 20 },
  preview: { fontSize: 13, color: colors.muted, lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 2 },
  meta: { flexShrink: 1, fontSize: 13, color: colors.coolgray },
  stats: { flexDirection: "row", alignItems: "center", gap: 12 },
  stat: { flexDirection: "row", alignItems: "center", gap: 4 },
  statText: { fontSize: 13, color: colors.coolgray },
  thumbBox: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line2,
    overflow: "hidden",
  },
})

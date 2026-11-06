import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React from "react"
import { ActionSheetIOS, Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { CommentContainer } from "@/components/comments/CommentContainer"
import { ItemManageBox } from "@/components/posts/ItemManageBox"
import { PostThumbsUpButton } from "@/components/posts/PostThumbsUpButton"
import { HtmlContent } from "@/components/ui/HtmlContent"
import { Icon } from "@/components/ui/Icon"
import { EmptyDataMessage, Loading, Separator } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useModeration } from "@/hooks/useModeration"
import { useAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { deletePost } from "@/services/posts"
import { PostCategoryLabel } from "@/types/posts"

const filter = filters()

/** 웹 app/(site)/posts/[id] — PostDetailClient + PostDetailContainer */
export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const postId = Number(id)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { successToast, errorToast } = useToast()
  const { report, block } = useModeration()

  const { data: post, isLoading } = useQuery({
    ...queries.posts.detail(postId),
    enabled: !!postId,
  })

  const handleDelete = () =>
    Alert.alert("커뮤니티 삭제", "커뮤니티를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePost(postId)
            successToast("커뮤니티가 삭제되었습니다.")
            queryClient.invalidateQueries({ queryKey: queries.posts._def })
            router.back()
          } catch (error: any) {
            errorToast(error?.message ?? "삭제에 실패했습니다.")
          }
        },
      },
    ])

  if (isLoading) return <Loading style={{ flex: 1 }} />
  if (!post)
    return (
      <>
        <Stack.Screen options={{ title: "나눔" }} />
        <EmptyDataMessage message="게시글을 찾을 수 없습니다." />
      </>
    )

  const isAuthor = !!user && user.id === post.authorId

  /** 남의 글: 신고·차단 메뉴 (App Store 1.2 UGC) */
  const openModerationMenu = () => {
    const options = ["신고", "이 사용자 차단", "취소"]
    ActionSheetIOS.showActionSheetWithOptions(
      { options, cancelButtonIndex: 2, destructiveButtonIndex: 1 },
      index => {
        if (index === 0) report("POST", post.id)
        if (index === 1) block(post.authorId, post.authorName)
      },
    )
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={100}>
      <Stack.Screen options={{ title: "나눔" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 16 }}>
          <View style={styles.breadcrumb}>
            <Text style={styles.breadcrumbLink}>나눔</Text>
            <Icon name="chevron.right" size={11} color={colors.gray400} />
            <Text style={styles.breadcrumbPage}>{PostCategoryLabel[post.category]}</Text>
          </View>
          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Icon name="clock" size={14} color={colors.gray400} />
              <Text style={styles.metaText}>{filter.FROM_NOW_COMMENT(post.createdAt)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="eye" size={16} color={colors.gray400} />
              <Text style={styles.metaText}>{post.viewCount}</Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="person.crop.circle" size={14} color={colors.gray400} />
              <Text style={styles.metaText}>{post.authorName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.separatorRow}>
          <Separator style={{ flex: 1, backgroundColor: colors.lightgray }} />
          {isAuthor ? (
            <ItemManageBox
              onEdit={() => router.push(`/posts/create?postId=${post.id}`)}
              onDelete={handleDelete}
            />
          ) : (
            <Pressable style={styles.moreButton} onPress={openModerationMenu} accessibilityLabel="신고 또는 차단" hitSlop={6}>
              <Icon name="ellipsis" size={18} color={colors.gray700} />
            </Pressable>
          )}
        </View>

        <HtmlContent html={post.contents} style={{ marginVertical: 32 }} />

        <View style={styles.reactions}>
          <PostThumbsUpButton
            postId={post.id}
            isLiked={post.isLiked}
            likeCount={post.likeCount}
          />
          <View style={styles.metaItem}>
            <Icon name="message" size={14} color={colors.gray700} />
            <Text style={{ fontSize: 14, color: colors.gray700 }}>{post.commentCount}</Text>
          </View>
        </View>

        <CommentContainer type="post" targetId={post.id} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  moreButton: { borderWidth: 2, borderColor: colors.whitesmoke, borderRadius: 8, padding: 8 },
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 80 },
  breadcrumb: { flexDirection: "row", alignItems: "center", gap: 6 },
  breadcrumbLink: { fontSize: 16, color: colors.gray500 },
  breadcrumbPage: { fontSize: 16, color: colors.gray900 },
  title: { fontSize: 26, color: colors.black },
  meta: { flexDirection: "row", gap: 20, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 14, color: colors.gray400 },
  separatorRow: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 40, marginTop: 8 },
  reactions: { flexDirection: "row", alignItems: "center", gap: 20, marginTop: 24 },
})

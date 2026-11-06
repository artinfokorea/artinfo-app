import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"

import { Button, Loading } from "@/components/ui/primitives"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { RichEditor } from "@/components/ui/RichEditor"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { PostPayload } from "@/interface/posts"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { createPost, updatePost } from "@/services/posts"
import { PostCategory, PostCategoryLabel } from "@/types/posts"

type FormErrors = Partial<Record<"title" | "contents" | "category", string>>

const isEmptyHtml = (html: string) =>
  !/<img/i.test(html) && html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim() === ""

/** 본문의 첫 번째 이미지를 썸네일로 쓴다 (웹 posts/create extractFirstImageUrl) */
const extractFirstImageUrl = (html: string) => html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null

/** 웹 app/(site)/posts/create + components/posts/PostForm. ?postId= 가 있으면 수정 */
export default function PostCreateScreen() {
  // 로그인이 필요한 화면 (웹 middleware 의 /*/create 와 같음)
  useSignInRedirect()
  const { postId } = useLocalSearchParams<{ postId?: string }>()
  const { isReady, isLoggedIn } = useAuth()

  const { data: post, isLoading } = useQuery({
    ...queries.posts.detail(Number(postId)),
    enabled: !!postId,
  })

  if (isReady && !isLoggedIn) return <Redirect href="/auth/sign-in" />

  return (
    <>
      <Stack.Screen options={{ title: postId ? "글 수정" : "글쓰기" }} />
      {postId && isLoading ? <Loading style={{ flex: 1 }} /> : <PostForm postId={postId} post={post} />}
    </>
  )
}

const PostForm = ({
  postId,
  post,
}: {
  postId?: string
  post?: { title: string; contents: string; category: PostCategory }
}) => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [title, setTitle] = useState(post?.title ?? "")
  const [contents, setContents] = useState(post?.contents ?? "")
  const [category, setCategory] = useState<PostCategory | undefined>(post?.category)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const next: FormErrors = {}
    if (!category) next.category = "카테고리를 선택해주세요."
    if (!title.trim()) next.title = "제목을 입력해주세요."
    if (isEmptyHtml(contents)) next.contents = "내용을 입력해주세요."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async () => {
    if (!validate() || !category) return
    const payload: PostPayload = { title: title.trim(), contents, category }
    const thumbnailImageUrl = extractFirstImageUrl(contents)
    if (thumbnailImageUrl) payload.thumbnailImageUrl = thumbnailImageUrl

    try {
      setIsSubmitting(true)
      if (postId) {
        await updatePost(Number(postId), payload)
        successToast("게시글이 수정되었습니다.")
      } else {
        await createPost(payload)
        successToast("게시글이 등록되었습니다.")
      }
      queryClient.invalidateQueries({ queryKey: queries.posts._def })
      router.back()
    } catch (error: any) {
      errorToast(error?.message ?? "요청에 실패했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.categories}>
          {Object.values(PostCategory).map(key => {
            const selected = category === key
            return (
              <Pressable
                key={key}
                onPress={() => setCategory(key)}
                style={[styles.category, selected && styles.categorySelected]}
              >
                <Text style={[styles.categoryText, selected && { color: colors.white }]}>
                  {PostCategoryLabel[key]}
                </Text>
              </Pressable>
            )
          })}
        </View>
        {errors.category ? <Text style={styles.error}>{errors.category}</Text> : null}

        <View style={{ marginVertical: 16 }}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해주세요."
            placeholderTextColor={colors.gray400}
            style={styles.titleInput}
          />
          {errors.title ? <Text style={styles.error}>{errors.title}</Text> : null}
        </View>

        <RichEditor
          initialHtml={post?.contents ?? ""}
          onChange={setContents}
          error={errors.contents}
          minHeight={320}
        />

        <View style={styles.actions}>
          <Button title="취소" variant="outline" size="sm" style={styles.actionButton} textStyle={{ color: colors.gray700 }} onPress={() => router.back()} />
          <Button
            title={postId ? "수정" : "등록"}
            size="sm"
            style={styles.actionButton}
            loading={isSubmitting}
            onPress={submit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 80 },
  categories: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  category: {
    height: 32,
    minWidth: 65,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  categorySelected: { backgroundColor: colors.main },
  categoryText: { fontSize: 12, fontWeight: "600", color: colors.black },
  titleInput: {
    fontSize: 17,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.whitesmoke,
    color: colors.black,
  },
  error: { marginTop: 6, fontSize: 12, fontWeight: "600", color: colors.error },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 },
  actionButton: { borderRadius: 24, paddingHorizontal: 24 },
})

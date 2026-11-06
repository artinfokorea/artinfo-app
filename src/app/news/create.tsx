import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native"

import { ImagePickerField } from "@/components/ui/ImagePickerField"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { Button, Loading, TextField } from "@/components/ui/primitives"
import { RichEditor } from "@/components/ui/RichEditor"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { NewsPayload } from "@/interface/news"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { createNews, updateNews } from "@/services/news"
import { UploadTarget } from "@/types"
import { NEWS } from "@/types/news"
import { UserType } from "@/types/users"

type FormErrors = Partial<Record<keyof NewsPayload, string>>

const isEmptyHtml = (html: string) =>
  !/<img/i.test(html) && html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim() === ""

/** 웹 app/(site)/news/create — 관리자만 접근. ?newsId= 가 있으면 수정 */
export default function NewsCreateScreen() {
  // 로그인이 필요한 화면 (웹 middleware 의 /*/create 와 같음)
  useSignInRedirect()
  const { newsId } = useLocalSearchParams<{ newsId?: string }>()
  const { isReady, isLoggedIn, user } = useAuth()

  const { data: news, isLoading } = useQuery({
    ...queries.news.detail(Number(newsId)),
    enabled: !!newsId,
  })

  if (isReady && !isLoggedIn) return <Redirect href="/auth/sign-in" />
  // 웹: CLIENT 사용자는 /news 로 돌려보낸다
  if (user && user.type !== UserType.ADMIN) return <Redirect href="/community?tab=news" />

  return (
    <>
      <Stack.Screen options={{ title: newsId ? "뉴스 수정" : "뉴스 등록" }} />
      {!user || (newsId && isLoading) ? (
        <Loading style={{ flex: 1 }} />
      ) : (
        <NewsForm newsId={newsId} news={news} />
      )}
    </>
  )
}

const NewsForm = ({ newsId, news }: { newsId?: string; news?: NEWS }) => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [form, setForm] = useState<NewsPayload>({
    title: news?.title ?? "",
    summary: news?.summary ?? "",
    contents: news?.contents ?? "",
    thumbnailImageUrl: news?.thumbnailImageUrl ?? "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const update = (key: keyof NewsPayload) => (value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const validate = () => {
    // 웹 lib/schemas newsSchema 메시지 그대로
    const next: FormErrors = {}
    if (!form.title.trim()) next.title = "제목을 입력해주세요."
    if (!form.summary.trim()) next.summary = "요약 내용을 입력해주세요."
    if (isEmptyHtml(form.contents)) next.contents = "내용을 입력해주세요."
    if (!form.thumbnailImageUrl) next.thumbnailImageUrl = "이미지를 등록해주세요."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    try {
      setIsSubmitting(true)
      if (newsId) {
        await updateNews(Number(newsId), form)
        successToast("뉴스가 수정되었습니다.")
      } else {
        await createNews(form)
        successToast("뉴스가 등록되었습니다.")
      }
      queryClient.invalidateQueries({ queryKey: queries.news._def })
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
        <ImagePickerField
          value={form.thumbnailImageUrl}
          onChange={url => {
            update("thumbnailImageUrl")(url)
            successToast("뉴스 썸네일이 등록되었습니다.")
          }}
          target={UploadTarget.NEWS}
          aspectRatio={27 / 17}
          error={errors.thumbnailImageUrl}
        />
        <TextField
          label="제목"
          value={form.title}
          onChangeText={update("title")}
          placeholder="제목을 입력해주세요."
          error={errors.title}
        />
        <TextField
          value={form.summary}
          onChangeText={update("summary")}
          placeholder="요약 내용을 입력해주세요."
          multiline
          style={{ minHeight: 160 }}
          error={errors.summary}
        />
        <RichEditor
          initialHtml={news?.contents ?? ""}
          onChange={update("contents")}
          error={errors.contents}
        />
        <View style={styles.actions}>
          <Button
            title="취소"
            variant="outline"
            size="sm"
            style={styles.actionButton}
            textStyle={{ color: colors.gray700 }}
            onPress={() => router.back()}
          />
          <Button
            title={newsId ? "수정" : "등록"}
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
  container: { padding: 16, paddingBottom: 80, gap: 16 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  actionButton: { borderRadius: 24, paddingHorizontal: 24 },
})

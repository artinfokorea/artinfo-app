import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React from "react"
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from "react-native"

import { CommentContainer } from "@/components/comments/CommentContainer"
import { ItemManageBox } from "@/components/posts/ItemManageBox"
import { HtmlContent } from "@/components/ui/HtmlContent"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { deleteNews } from "@/services/news"
import { UserType } from "@/types/users"

const filter = filters()

/** 웹 app/(site)/news/[id] — NewsDetailClient + NewsDetailContainer */
export default function NewsDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const newsId = Number(id)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const { successToast, errorToast } = useToast()

  const { data: news, isLoading } = useQuery({
    ...queries.news.detail(newsId),
    enabled: !!newsId,
  })

  const handleDelete = () =>
    Alert.alert("뉴스 삭제", "뉴스를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNews(newsId)
            successToast("뉴스가 삭제되었습니다.")
            queryClient.invalidateQueries({ queryKey: queries.news._def })
            router.back()
          } catch (error: any) {
            errorToast(error?.message ?? "삭제에 실패했습니다.")
          }
        },
      },
    ])

  if (isLoading) return <Loading style={{ flex: 1 }} />
  if (!news)
    return (
      <>
        <Stack.Screen options={{ title: "뉴스" }} />
        <EmptyDataMessage message="뉴스를 찾을 수 없습니다." />
      </>
    )

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={100}>
      <Stack.Screen options={{ title: "뉴스" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ gap: 16, marginTop: 48 }}>
          <Text style={styles.title}>{news.title}</Text>
          <Text style={styles.date}>{filter.YYYYMMDD(news.createdAt)}</Text>
        </View>

        {user?.type === UserType.ADMIN ? (
          <ItemManageBox
            onEdit={() => router.push(`/news/create?newsId=${news.id}`)}
            onDelete={handleDelete}
            style={{ justifyContent: "flex-end", marginTop: 32 }}
          />
        ) : null}

        <HtmlContent html={news.contents} style={{ marginTop: 48 }} />

        <CommentContainer type="news" targetId={news.id} />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 80 },
  title: { fontSize: 26, textAlign: "center", color: colors.black },
  date: { fontSize: 14, fontWeight: "500", textAlign: "center", color: colors.coolgray },
})

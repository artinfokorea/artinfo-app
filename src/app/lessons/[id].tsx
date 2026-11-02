import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { LessonApplyModal } from "@/components/lessons/LessonApplyModal"
import { ItemManageBox } from "@/components/lessons/ListParts"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { HtmlContent } from "@/components/ui/HtmlContent"
import { Icon } from "@/components/ui/Icon"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { deleteLesson, lessonApply } from "@/services/lessons"
import { SchoolType, SchoolTypeValues } from "@/types/lessons"

const filter = filters()

const schoolIcon = (type: SchoolType) =>
  type === SchoolType.UNDERGRADUATE ? "graduationcap" : type === SchoolType.MASTER ? "graduationcap.fill" : "rosette"

/** 웹 components/lessons/LessonDetailContainer */
export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const lessonId = Number(id)
  const { isLoggedIn, user } = useAuth()
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const { data: lesson, isLoading } = useQuery(queries.lessons.detail(lessonId))

  const isAuthor = !!user && user.id === lesson?.authorId

  const checkPhone = () => {
    if (!isLoggedIn) {
      Alert.alert("로그인이 필요합니다.", "레슨 문의를 위해 로그인이 필요합니다.", [
        { text: "취소", style: "cancel" },
        { text: "로그인", onPress: () => router.push("/auth/sign-in") },
      ])
      return
    }
    if (!user?.phone) {
      Alert.alert("레슨 신청을 위해 연락처를 등록해 주세요.", undefined, [
        { text: "취소", style: "cancel" },
        { text: "프로필로 이동하기", onPress: () => router.push("/my-profile") },
      ])
      return
    }
    setIsApplyOpen(true)
  }

  const handleApply = async (contents: string) => {
    if (!lesson) return
    try {
      setIsApplying(true)
      await lessonApply({ teacherId: lesson.authorId, contents })
      successToast("레슨 신청이 완료되었습니다.")
      setIsApplyOpen(false)
    } catch {
      errorToast("레슨 신청에 실패했습니다.")
    } finally {
      setIsApplying(false)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteLesson()
      successToast("레슨이 삭제되었습니다.")
      queryClient.invalidateQueries({ queryKey: queries.lessons._def })
      router.back()
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? error.message)
    }
  }

  if (isLoading) return <Loading />
  if (!lesson) return <EmptyDataMessage message="레슨 정보를 찾을 수 없습니다." />

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
      <Stack.Screen options={{ title: lesson.name }} />
      <View style={{ paddingTop: 24 }}>
        {lesson.imageUrl ? (
          <FallbackImage src={lesson.imageUrl} style={styles.photo} />
        ) : null}
        <View style={{ padding: 16 }}>
          <Text style={styles.name}>{lesson.name}</Text>

          {isAuthor ? (
            <View style={styles.manageRow}>
              <View style={styles.line} />
              <ItemManageBox
                onEdit={() => router.push(`/lessons/create?id=${lesson.id}`)}
                onDelete={handleDelete}
                deleteTitle="레슨 삭제"
                deleteMessage="레슨을 삭제하시겠습니까?"
              />
            </View>
          ) : null}

          <View style={{ marginTop: 24, gap: 16 }}>
            <View style={styles.inlineRow}>
              <Text style={styles.label}>전공</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, flex: 1 }}>
                {lesson.majors?.map(major => (
                  <View key={major} style={styles.majorBadge}>
                    <Text style={styles.majorBadgeText}>{major}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.inlineRow}>
              <Text style={styles.label}>가격</Text>
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {filter.FEECOMMA(lesson.pay)}원
                <Text style={{ fontSize: 12 }}> (1회)</Text>
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={styles.label}>학력</Text>
              {lesson.schools?.map(school => (
                <View key={school.id} style={styles.school}>
                  <Icon name={schoolIcon(school.type)} size={28} color={colors.main} />
                  <View>
                    <Text style={styles.schoolName}>{school.name}</Text>
                    <Text style={styles.schoolType}>{SchoolTypeValues[school.type]}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={{ gap: 8 }}>
              <Text style={styles.label}>지역</Text>
              <Text style={{ fontSize: 14 }}>{lesson.areas?.join(", ")}</Text>
            </View>

            {!isAuthor ? (
              <Pressable onPress={checkPhone} hitSlop={6}>
                <Text style={styles.applyText}>레슨 문의하기</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <View style={[styles.line, { marginHorizontal: 16, marginVertical: 16 }]} />

      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        <TextPanel title="전문가 소개" text={lesson.introduction} />
        {lesson.career ? <TextPanel title="경력" text={lesson.career} /> : null}
      </View>

      <LessonApplyModal
        visible={isApplyOpen}
        loading={isApplying}
        onClose={() => setIsApplyOpen(false)}
        onApply={handleApply}
      />
    </ScrollView>
  )
}

/** 회색 박스 안의 줄바꿈 유지 텍스트 (URL 은 링크로) */
const TextPanel = ({ title, text }: { title: string; text?: string }) => (
  <View style={styles.panel}>
    <Text style={styles.panelTitle}>{title}</Text>
    <HtmlContent
      fontSize={15}
      html={`<div style="white-space:pre-wrap">${filter.URLFY(text) ?? ""}</div>`}
    />
  </View>
)

const styles = StyleSheet.create({
  photo: { width: 240, height: 320, borderRadius: 6, alignSelf: "center" },
  name: { textAlign: "center", fontSize: 24, fontWeight: "700", marginTop: 8 },
  manageRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 8 },
  line: { flex: 1, height: 2, backgroundColor: colors.whitesmoke },
  inlineRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  label: { fontSize: 16, fontWeight: "700" },
  majorBadge: { backgroundColor: colors.main, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  majorBadgeText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  school: { flexDirection: "row", alignItems: "center", gap: 24 },
  schoolName: { fontSize: 16, fontWeight: "600", color: colors.primary },
  schoolType: { fontSize: 14, color: colors.coolgray },
  applyText: { fontSize: 16, fontWeight: "600", color: colors.main },
  panel: { backgroundColor: colors.whitesmoke, borderRadius: 6, padding: 16, minHeight: 200 },
  panelTitle: { fontSize: 18, fontWeight: "600", color: colors.coolgray, marginBottom: 12 },
})

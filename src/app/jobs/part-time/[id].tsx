import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"

import { MajorBadges } from "@/components/jobs/JobCard"
import { ItemManageBox } from "@/components/jobs/ItemManageBox"
import { PartTimeApplySheet } from "@/components/jobs/PartTimeApplySheet"
import { ShareButton } from "@/components/jobs/ShareButton"
import { errorMessage, useJobMutation } from "@/components/jobs/useJobMutation"
import { HtmlContent } from "@/components/ui/HtmlContent"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth, useRequireAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { applyPartTimeJob, deleteJob, updateJobStatus } from "@/services/jobs"
import { getLessonQualification } from "@/services/lessons"

const filter = filters()

const InfoItem = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoTitle}>{title}</Text>
    <View style={{ flex: 1 }}>{children}</View>
  </View>
)

/** 웹 app/(site)/jobs/part-time/[id] → PartTimeDetailClient / PartTimeDetailContainer */
export default function PartTimeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const jobId = Number(id)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const requireAuth = useRequireAuth()
  const { successToast, errorToast } = useToast()
  const { run } = useJobMutation()
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const { data: job, isLoading, isError, refetch, isRefetching } = useQuery(queries.jobs.detail(jobId))

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "단기 채용" }} />
        <Loading style={{ flex: 1 }} />
      </>
    )
  }
  if (isError || !job) {
    return (
      <>
        <Stack.Screen options={{ title: "단기 채용" }} />
        <EmptyDataMessage message="채용 공고를 찾을 수 없습니다." />
      </>
    )
  }

  const isAuthor = !!user && user.id === job.authorId

  const handleDelete = async () => {
    const result = await run(() => deleteJob(job.id), "채용이 삭제되었습니다.")
    if (result) router.back()
  }

  const handleToggleStatus = async () => {
    try {
      await updateJobStatus(job.id, !job.isActive)
      await queryClient.invalidateQueries({ queryKey: [...queries.jobs._def] })
      successToast("채용 상태가 변경되었습니다.")
    } catch {
      errorToast("채용 상태 변경에 실패하였습니다.")
    }
  }

  // 웹: 신청 전에 /lessons/qualification 으로 프로필(전공·학력·연락처) 작성 여부를 확인한다
  const handleOpenApply = async () => {
    if (!requireAuth()) return
    try {
      setIsChecking(true)
      await getLessonQualification()
      setIsApplyOpen(true)
    } catch {
      Alert.alert("연주 신청 권한이 없습니다.", "프로필(전공, 학력, 연락처)를 작성해 주세요.", [
        { text: "취소", style: "cancel" },
        { text: "프로필로 이동하기", onPress: () => router.push("/my-profile") },
      ])
    } finally {
      setIsChecking(false)
    }
  }

  const handleApply = async (profile: string) => {
    try {
      setIsApplying(true)
      await applyPartTimeJob(job.id, profile)
      successToast("채용 신청이 완료되었습니다.")
      setIsApplyOpen(false)
    } catch (error) {
      errorToast(errorMessage(error, "채용 신청에 실패하였습니다."))
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "단기 채용",
          headerRight: () => <ShareButton path={`/jobs/part-time/${job.id}`} title={job.title} />,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      >
        <Text style={styles.title}>{job.title}</Text>
        <View style={styles.infoList}>
          <InfoItem title="단체명">
            <Text style={styles.infoValue}>{job.companyName}</Text>
          </InfoItem>
          <InfoItem title="급여">
            <Text style={styles.infoValue}>{filter.FEECOMMA(job.fee)}원</Text>
          </InfoItem>
          <InfoItem title="전공">
            <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
              <MajorBadges majors={job.majors?.majors} max={2} />
            </View>
          </InfoItem>
          <InfoItem title="주소">
            <Text style={styles.infoValue}>
              {job.address} {job.addressDetail}
            </Text>
          </InfoItem>
          <InfoItem title="일정">
            <View style={{ gap: 4 }}>
              {job.schedules?.map((schedule, index) => (
                <Text key={index} style={styles.infoValue}>
                  {filter.YYYYMMDD(schedule.startAt, "YYYY년 MM월 DD일 (ddd)")}  시간{"  "}
                  {filter.YYYYMMDD(schedule.startAt, "HH:mm ~ ")}
                  {filter.YYYYMMDD(schedule.endAt, "HH:mm")}
                </Text>
              ))}
            </View>
          </InfoItem>
        </View>

        {isAuthor ? (
          <View style={styles.manageRow}>
            <ItemManageBox
              onEdit={() => router.push({ pathname: "/jobs/part-time/create", params: { id: String(job.id) } })}
              onDelete={handleDelete}
              deleteTitle="채용 삭제"
              deleteDescription="채용을 삭제하시겠습니까?"
            />
            <Pressable onPress={handleToggleStatus} style={styles.statusButton}>
              <Text style={[styles.statusText, { color: job.isActive ? colors.main : colors.grayfont }]}>
                {job.isActive ? "진행중" : "마감"}
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.divider}>
          <View style={styles.line} />
          {!isAuthor ? (
            isChecking ? (
              <ActivityIndicator color={colors.main} />
            ) : (
              <Pressable onPress={handleOpenApply} hitSlop={8}>
                <Text style={styles.apply}>연주 신청</Text>
              </Pressable>
            )
          ) : null}
          <View style={styles.line} />
        </View>

        {job.contents ? <HtmlContent html={job.contents} /> : null}
      </ScrollView>

      <PartTimeApplySheet
        visible={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        onApply={handleApply}
        loading={isApplying}
      />
    </>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 32, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: "700", color: colors.black },
  infoList: { marginTop: 32, gap: 24 },
  infoRow: { flexDirection: "row", alignItems: "flex-start" },
  infoTitle: { width: "20%", fontSize: 14, fontWeight: "600", color: colors.grayfont },
  infoValue: { fontSize: 14, color: colors.black },
  manageRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 },
  statusButton: {
    borderWidth: 1,
    borderColor: colors.whitesmoke,
    borderRadius: 4,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  statusText: { fontSize: 14, fontWeight: "600" },
  divider: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 24 },
  line: { flex: 1, height: 1, backgroundColor: colors.whitesmoke },
  apply: { fontSize: 14, fontWeight: "600", color: colors.main },
})

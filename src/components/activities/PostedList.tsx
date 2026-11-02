import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { ApplicantsList } from "@/components/activities/ApplicantsList"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { updateJobStatus } from "@/services/jobs"
import { JOB } from "@/types/jobs"

export const ActivityButton = ({
  title,
  onPress,
  disabled,
}: {
  title: string
  onPress?: () => void
  disabled?: boolean
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }, disabled && { opacity: 0.4 }]}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>
)

/** 웹 components/activities/PostedList — 내가 올린 단기(연주) 채용 */
export const PostedList = () => {
  const filter = filters()
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [openApplicants, setOpenApplicants] = useState<Record<number, boolean>>({})

  const { data, isLoading } = useQuery(queries.jobs.myActivities({ page: 1, size: 10 }))

  const toggleStatus = async (job: JOB) => {
    try {
      await updateJobStatus(job.id, !job.isActive)
      await queryClient.invalidateQueries({ queryKey: [...queries.jobs._def] })
      successToast("채용 상태가 변경되었습니다.")
    } catch {
      errorToast("채용 상태 변경에 실패하였습니다.")
    }
  }

  if (isLoading) return <Loading style={{ marginTop: 48 }} />
  if (!data?.jobs?.length) return <EmptyDataMessage />

  return (
    <View style={{ gap: 16 }}>
      {data.jobs.map(job => (
        <View key={job.id}>
          <View style={styles.card}>
            <View style={styles.titleRow}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>제목</Text>
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {job.title}
              </Text>
            </View>
            <View style={styles.actions}>
              <ActivityButton
                title="신청자"
                onPress={() => setOpenApplicants(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
              />
              <ActivityButton title={job.isActive ? "진행중" : "마감"} onPress={() => toggleStatus(job)} />
              <ActivityButton
                title="바로가기"
                disabled={!job.isActive}
                onPress={() => router.push(`/jobs/part-time/${job.id}`)}
              />
            </View>
            <Text style={{ alignSelf: "flex-end", color: colors.gray700 }}>
              {filter.YYYYMMDD(job.createdAt)}
            </Text>
            {!job.isActive ? <View pointerEvents="none" style={styles.inactiveOverlay} /> : null}
          </View>
          {openApplicants[job.id] ? <ApplicantsList jobId={job.id} /> : null}
        </View>
      ))}
    </View>
  )
}

export const activityStyles = StyleSheet.create({
  card: {
    gap: 14,
    borderWidth: 1,
    borderColor: colors.lightgray,
    borderRadius: 4,
    padding: 16,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  tag: { backgroundColor: colors.main, borderRadius: 4, paddingHorizontal: 12, paddingVertical: 4 },
  tagText: { color: colors.white },
  title: { flex: 1, fontSize: 15, color: colors.gray900 },
  inactiveOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(107,114,128,0.5)", borderRadius: 4 },
})

const styles = StyleSheet.create({
  ...activityStyles,
  actions: { flexDirection: "row", gap: 8 },
  button: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.white,
    zIndex: 1,
  },
  buttonText: { color: colors.main, fontSize: 14 },
})

import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React from "react"
import { StyleSheet, Text, View } from "react-native"

import { ActivityButton, activityStyles } from "@/components/activities/PostedList"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import filters from "@/lib/filters"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"

/** 웹 components/activities/JoinedList — 내가 지원한 연주 */
export const JoinedList = () => {
  const filter = filters()
  const { user } = useAuth()

  const { data, isLoading } = useQuery({
    ...queries.jobs.myApplyList(user?.id as number, { page: 1, size: 10 }),
    enabled: !!user?.id,
  })

  if (!user || isLoading) return <Loading style={{ marginTop: 48 }} />
  if (!data?.jobs?.length) return <EmptyDataMessage />

  return (
    <View style={{ gap: 16 }}>
      {data.jobs.map(job => (
        <View key={job.id} style={activityStyles.card}>
          <View style={activityStyles.titleRow}>
            <View style={activityStyles.tag}>
              <Text style={activityStyles.tagText}>제목</Text>
            </View>
            <Text style={activityStyles.title} numberOfLines={2}>
              {job.title}
            </Text>
          </View>
          <View style={activityStyles.titleRow}>
            <View style={activityStyles.tag}>
              <Text style={activityStyles.tagText}>신청일</Text>
            </View>
            <Text>{filter.YYYYMMDD(job.appliedAt)}</Text>
          </View>
          <View style={styles.actions}>
            <ActivityButton title={job.isActive ? "선발중" : "마감"} />
            <ActivityButton title="바로가기" onPress={() => router.push(`/jobs/part-time/${job.id}`)} />
          </View>
          {!job.isActive ? <View pointerEvents="none" style={activityStyles.inactiveOverlay} /> : null}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
})

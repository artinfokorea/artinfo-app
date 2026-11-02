import { router } from "expo-router"
import React, { memo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { MajorBadges, ProvinceBadge } from "@/components/jobs/JobCard"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { JOB } from "@/types/jobs"

const filter = filters()

/** 웹 components/jobs/JobPartTimeCard: 마감된 공고는 회색 덮개 + 눌러도 이동하지 않음 */
export const JobPartTimeCard = memo(({ job }: { job: JOB }) => {
  const schedules = job.schedules ?? []
  return (
    <Pressable
      disabled={!job.isActive}
      onPress={() => router.push(`/jobs/part-time/${job.id}`)}
      style={styles.card}
    >
      <Text style={styles.title} numberOfLines={2}>
        {job.title}
      </Text>
      <View style={styles.badges}>
        <ProvinceBadge address={job.address} />
        <MajorBadges majors={job.majors?.majors} max={3} />
      </View>
      <View style={{ gap: 4 }}>
        <Text style={styles.company}>{job.companyName}</Text>
        {schedules.length > 0 ? (
          <Text style={styles.schedule}>
            {filter.YYYYMMDD(schedules[0].startAt)}~ {filter.YYYYMMDD(schedules[schedules.length - 1].endAt)}
          </Text>
        ) : null}
      </View>
      {!job.isActive ? <View pointerEvents="none" style={styles.inactive} /> : null}
    </Pressable>
  )
})
JobPartTimeCard.displayName = "JobPartTimeCard"

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    minHeight: 160,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.whitesmoke,
    padding: 16,
  },
  title: { fontSize: 18, fontWeight: "600", color: colors.black },
  badges: { flexDirection: "row", gap: 6, marginVertical: 12, flexWrap: "wrap" },
  company: { fontSize: 12, fontWeight: "600", color: colors.coolgray },
  schedule: { fontSize: 12, fontWeight: "600", color: colors.black },
  inactive: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
    backgroundColor: "rgba(107,114,128,0.5)",
  },
})

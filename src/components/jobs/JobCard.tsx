import { router } from "expo-router"
import React, { memo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { JOB, JobType } from "@/types/jobs"
import { MAJOR } from "@/types/majors"

const filter = filters()

/** 지역 뱃지: 주소의 첫 단어 앞 두 글자 (웹과 동일) */
export const provinceLabel = (address?: string) => address?.split(" ")[0]?.substring(0, 2)

/** 전공 뱃지 목록. max 개를 넘으면 마지막 뱃지를 "OO 외 N" 으로 표시 */
export const MajorBadges = ({
  majors,
  max,
  size = "sm",
}: {
  majors?: MAJOR[]
  max: number
  size?: "xs" | "sm"
}) => {
  if (!majors?.length) return null
  const shown = majors.slice(0, max)
  return (
    <>
      {shown.map((major, index) => {
        const isLast = majors.length > max && index === max - 1
        return (
          <View key={major.id} style={styles.majorBadge}>
            <Text style={[styles.majorBadgeText, size === "xs" && { fontSize: 10 }]} numberOfLines={1}>
              {isLast ? `${major.koName} 외 ${majors.length - max}` : major.koName}
            </Text>
          </View>
        )
      })}
    </>
  )
}

export const ProvinceBadge = ({ address, size = "sm" }: { address?: string; size?: "xs" | "sm" }) => {
  const label = provinceLabel(address)
  if (!label) return null
  return (
    <View style={styles.provinceBadge}>
      <Text style={[styles.provinceBadgeText, size === "xs" && { fontSize: 10 }]}>{label}</Text>
    </View>
  )
}

/**
 * 웹 components/jobs/JobCard + ReligionCard (모바일 레이아웃).
 * 종교 공고는 이미지 대신 기관명을 보여주고, 날짜는 마감일(endAt)을 쓴다.
 */
export const JobCard = memo(({ job }: { job: JOB }) => {
  const isReligion = job.type === JobType.RELIGION
  const showImage = !isReligion && !!job.imageUrl

  return (
    <Pressable
      onPress={() => router.push(`/jobs/${job.id}`)}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: "#f5f5f5" }]}
    >
      <View style={styles.thumb}>
        {showImage ? (
          <FallbackImage src={job.imageUrl} fallbackText={job.companyName} style={styles.thumbImage} />
        ) : (
          <Text style={styles.thumbText} numberOfLines={3}>
            {job.companyName}
          </Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={isReligion ? 1 : 2}>
          {job.title}
        </Text>
        <View style={styles.badges}>
          <ProvinceBadge address={job.address} size="xs" />
          <MajorBadges majors={job.majors?.majors} max={1} size="xs" />
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText} numberOfLines={1}>
            {job.companyName}
          </Text>
          <Text style={styles.footerText}>
            {filter.YYYYMMDD(isReligion ? job.endAt : job.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  )
})
JobCard.displayName = "JobCard"

const styles = StyleSheet.create({
  card: {
    height: 130,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  thumb: {
    width: 150,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 8,
  },
  thumbImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  thumbText: { fontSize: 16, fontWeight: "700", color: colors.black, textAlign: "center" },
  body: { flex: 1, marginLeft: 16, paddingVertical: 8 },
  title: { fontSize: 14, fontWeight: "700", color: colors.black, lineHeight: 18 },
  badges: { flexDirection: "row", alignItems: "center", gap: 6, marginVertical: 8, flexWrap: "nowrap" },
  footer: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  footerText: { fontSize: 12, color: colors.coolgray, flexShrink: 1 },
  majorBadge: {
    backgroundColor: colors.main,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    flexShrink: 1,
  },
  majorBadgeText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  provinceBadge: {
    borderWidth: 1,
    borderColor: colors.main,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 1,
    backgroundColor: colors.white,
  },
  provinceBadgeText: { color: colors.main, fontSize: 12, fontWeight: "600" },
})

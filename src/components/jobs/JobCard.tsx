import { router } from "expo-router"
import React, { memo } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { shortRegion } from "@/lib/regions"
import { JOB, JobType } from "@/types/jobs"
import { MAJOR } from "@/types/majors"

const filter = filters()

/** 지역 뱃지: 주소의 첫 단어 앞 두 글자 (웹과 동일) */
export const provinceLabel = (address?: string) => shortRegion(address) || undefined

/**
 * 전공 뱃지 목록 (단기 공고 카드·상세에서 사용).
 * max 를 주면 그 개수를 넘을 때 마지막 뱃지를 "OO 외 N" 으로 표시하고, 안 주면 모두 펼친다 (웹 6a2650c).
 */
export const MajorBadges = ({
  majors,
  max,
  size = "sm",
}: {
  majors?: MAJOR[]
  max?: number
  size?: "xs" | "sm"
}) => {
  if (!majors?.length) return null
  const shown = max ? majors.slice(0, max) : majors
  return (
    <>
      {shown.map((major, index) => {
        const isLast = !!max && majors.length > max && index === max - 1
        return (
          <View key={major.id} style={styles.majorBadge}>
            <Text style={[styles.majorBadgeText, size === "xs" && { fontSize: 10 }]} numberOfLines={1}>
              {isLast ? `${major.koName} 외 ${majors.length - max!}` : major.koName}
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
 * 웹 components/jobs/JobCard (모바일) — 5:3 썸네일(110×66, 이미지는 contain) + 제목 2줄 + 메타 한 줄.
 * 이미지가 없거나 종교 공고면 기관명 박스로 대신한다.
 */
export const JobCard = memo(({ job }: { job: JOB }) => {
  const showImage = !!job.imageUrl && job.type !== JobType.RELIGION
  const meta = [job.companyName, shortRegion(job.address), filter.FROM_NOW_COMMENT(job.createdAt)]
    .filter(Boolean)
    .join(" · ")

  return (
    <Pressable
      onPress={() => router.push(`/jobs/${job.id}`)}
      style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.surface2 }]}
    >
      <View style={styles.thumb}>
        {showImage ? (
          <FallbackImage
            src={job.imageUrl}
            fallbackText={job.companyName}
            contentFit="contain"
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <Text style={styles.thumbText} numberOfLines={3}>
            {job.companyName}
          </Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {job.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
    </Pressable>
  )
})
JobCard.displayName = "JobCard"

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  thumb: {
    width: 110,
    height: 66,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line2,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    paddingHorizontal: 6,
  },
  thumbText: { fontSize: 11, fontWeight: "700", color: colors.ink3, textAlign: "center", lineHeight: 14 },
  body: { flex: 1, minWidth: 0, gap: 4 },
  title: { fontSize: 15, fontWeight: "700", color: colors.ink, lineHeight: 20 },
  meta: { fontSize: 13, color: colors.coolgray },
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

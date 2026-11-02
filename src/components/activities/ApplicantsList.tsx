import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { Loading, Separator } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { SchoolTypeValues } from "@/types/lessons"

/** 웹 components/activities/ApplicantsList — 지원자를 한 명씩 넘겨 본다 */
export const ApplicantsList = ({ jobId }: { jobId: number }) => {
  const { data, isLoading } = useQuery(queries.jobs.applicantList(jobId))
  const [page, setPage] = useState(0)

  if (isLoading) return <Loading style={styles.box} />

  const applicants = data?.applicants ?? []
  if (applicants.length === 0) {
    return (
      <View style={styles.box}>
        <Text style={{ color: colors.gray700 }}>신청자가 없습니다</Text>
      </View>
    )
  }

  const applicant = applicants[page]

  return (
    <View style={styles.box}>
      <View style={styles.pager}>
        <Pressable
          onPress={() => setPage(prev => prev - 1)}
          disabled={page === 0}
          style={styles.pagerButton}
          accessibilityLabel="이전 신청자"
        >
          <Icon name="chevron.left" size={14} color={page === 0 ? colors.gray200 : colors.gray700} />
        </Pressable>
        <View style={styles.pagerLabel}>
          <Text style={{ color: colors.gray700 }}>
            {page + 1} / {applicants.length}
          </Text>
        </View>
        <Pressable
          onPress={() => setPage(prev => prev + 1)}
          disabled={page === applicants.length - 1}
          style={styles.pagerButton}
          accessibilityLabel="다음 신청자"
        >
          <Icon
            name="chevron.right"
            size={14}
            color={page === applicants.length - 1 ? colors.gray200 : colors.gray700}
          />
        </Pressable>
      </View>

      {applicant ? (
        <View style={{ gap: 14 }}>
          <FallbackImage src={applicant.iconImageUrl} style={styles.avatar} />
          <View style={styles.row}>
            <Text style={styles.label}>이름</Text>
            <Text style={styles.value}>{applicant.name}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>전공</Text>
            <View style={[styles.value, { flexDirection: "row", flexWrap: "wrap", gap: 4 }]}>
              {applicant.majors?.map(major => (
                <View key={major.id} style={styles.badge}>
                  <Text style={styles.badgeText}>{major.koName}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={[styles.row, { alignItems: "center" }]}>
            <View style={styles.label}>
              <Icon name="phone" size={18} color={colors.gray700} />
            </View>
            <Text style={styles.value}>{applicant.phone}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>학력</Text>
            <View style={[styles.value, { gap: 6 }]}>
              {applicant.schools?.map(school => (
                <View key={school.type}>
                  <Text>{school.name}</Text>
                  <Text style={{ fontSize: 13, color: colors.grayfont }}>
                    {SchoolTypeValues[school.type]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <Separator style={{ backgroundColor: colors.grayfont }} />
          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.grayfont }}>소개</Text>
            <Text style={{ lineHeight: 22 }}>{applicant.profile}</Text>
          </View>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: colors.gray200,
    borderTopWidth: 0,
    padding: 16,
    gap: 12,
  },
  pager: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 12 },
  pagerButton: {
    borderWidth: 1,
    borderColor: colors.gray200,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  pagerLabel: { borderWidth: 1, borderColor: colors.gray200, paddingHorizontal: 8, paddingVertical: 4 },
  avatar: { width: 150, height: 150, borderRadius: 75, alignSelf: "center", marginVertical: 8 },
  row: { flexDirection: "row", gap: 16 },
  label: { width: 40, color: colors.grayfont },
  value: { flex: 1 },
  badge: { backgroundColor: colors.main, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: colors.white, fontSize: 12 },
})

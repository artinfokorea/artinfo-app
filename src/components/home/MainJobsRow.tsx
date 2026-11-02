import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React from "react"
import { FlatList, Pressable, StyleSheet, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { SectionHeader } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { JobType } from "@/types/jobs"
import { ProfessionalFieldTypes } from "@/types/majors"

/** 홈 화면 채용 쿼리 (웹 app/(site)/page.tsx 와 동일한 조건) */
export const MAIN_JOBS_REQUEST = {
  page: 1,
  size: 5,
  types: [JobType.ART_ORGANIZATION, JobType.LECTURER],
  professionalFields: [
    ProfessionalFieldTypes.CLASSIC,
    ProfessionalFieldTypes.POPULAR_MUSIC,
    ProfessionalFieldTypes.TRADITIONAL_MUSIC,
    ProfessionalFieldTypes.ADMINISTRATION,
    ProfessionalFieldTypes.ART,
  ],
}

/** 웹 components/main/MainJobsContainer (모바일): 5:3 카드 가로 스크롤, 폭 150 */
export const MainJobsRow = () => {
  const { data } = useQuery(queries.jobs.list(MAIN_JOBS_REQUEST))

  return (
    <View style={styles.section}>
      <SectionHeader title="채용" onMore={() => router.navigate("/jobs")} />
      <FlatList
        data={data?.jobs ?? []}
        keyExtractor={job => String(job.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/jobs/${item.id}`)} style={styles.card}>
            <FallbackImage src={item.imageUrl} fallbackText={item.companyName} style={styles.image} />
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginVertical: 24 },
  card: {
    width: 150,
    aspectRatio: 5 / 3,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    overflow: "hidden",
  },
  image: { width: "100%", height: "100%" },
})

import { useQueries } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native"

import { JobCard } from "@/components/jobs/JobCard"
import { JobFilters, JobFilterTabs, JobTimeTypeTab } from "@/components/jobs/JobFilterTabs"
import { JobPartTimeCard } from "@/components/jobs/JobPartTimeCard"
import { Icon } from "@/components/ui/Icon"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { SearchBar } from "@/components/ui/SearchBar"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { JOB, JobTimeType, JobType } from "@/types/jobs"
import { ArtType } from "@/types/majors"

const INITIAL_FILTERS: JobFilters = { recruit: "", provinceId: "", professional: "", majorGroup: "" }

/** 웹 app/(site)/jobs/page.tsx (모바일 레이아웃) */
export default function JobsScreen() {
  const params = useLocalSearchParams<{ jobTimeType?: JobTimeType }>()
  const requireAuth = useRequireAuth()
  const listRef = useRef<FlatList<JOB>>(null)

  const [jobTimeType, setJobTimeType] = useState<JobTimeType>(params.jobTimeType ?? JobTimeType.FULL_TIME)
  const [keyword, setKeyword] = useState("")
  const [filters, setFilters] = useState<JobFilters>(INITIAL_FILTERS)

  useEffect(() => {
    if (params.jobTimeType) setJobTimeType(params.jobTimeType)
  }, [params.jobTimeType])

  const [artFields, provinceList, majorGroups] = useQueries({
    queries: [
      queries.majors.artFields({ artCategories: [ArtType.MUSIC] }),
      queries.provinces.list(),
      queries.majors.partTimeMajorGroups(),
    ],
  })

  const isPartTime = jobTimeType === JobTimeType.PART_TIME
  const provinceIds = filters.provinceId ? [Number(filters.provinceId)] : []

  // 웹 components/jobs/JobList 의 getJobTypes / getMajorGroups 와 같은 규칙
  const fullTimeRequest = useMemo(() => {
    const types =
      jobTimeType === JobTimeType.AMATEUR
        ? [JobType.AMATEUR]
        : jobTimeType === JobTimeType.YOUTH
          ? [JobType.YOUTH]
          : filters.recruit
            ? [filters.recruit]
            : [JobType.ART_ORGANIZATION, JobType.LECTURER, JobType.RELIGION]
    const isAmateurOrYouth = jobTimeType === JobTimeType.AMATEUR || jobTimeType === JobTimeType.YOUTH
    return {
      size: 10,
      types,
      keyword: keyword || undefined,
      professionalFields: filters.professional ? [filters.professional] : [],
      provinceIds,
      majorGroups: isAmateurOrYouth && filters.majorGroup ? [filters.majorGroup] : [],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobTimeType, keyword, filters])

  const partTimeRequest = useMemo(
    () => ({
      size: 10,
      majorGroups: filters.majorGroup ? [filters.majorGroup] : [],
      keyword: keyword || undefined,
      provinceIds,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [keyword, filters],
  )

  const fullTimeList = useInfiniteList<JOB, "jobs">(queries.jobs.infiniteList(fullTimeRequest), "jobs", {
    enabled: !isPartTime,
  })
  const partTimeList = useInfiniteList<JOB, "jobs">(
    queries.jobs.infinitePartTimeList(partTimeRequest),
    "jobs",
    { enabled: isPartTime },
  )
  const list = isPartTime ? partTimeList : fullTimeList

  const changeJobTimeType = (next: JobTimeType) => {
    setJobTimeType(next)
    listRef.current?.scrollToOffset({ offset: 0, animated: false })
  }

  const goToCreate = () => {
    if (!requireAuth()) return
    if (jobTimeType === JobTimeType.PART_TIME) {
      router.push("/jobs/part-time/create")
    } else if (jobTimeType === JobTimeType.AMATEUR || jobTimeType === JobTimeType.YOUTH) {
      router.push({ pathname: "/jobs/create", params: { jobType: jobTimeType } })
    } else {
      router.push("/jobs/create")
    }
  }

  const header = (
    <View>
      <View style={styles.searchArea}>
        <Text style={styles.headline}>취업은 아트인포와 함께</Text>
        <SearchBar value={keyword} onSubmit={setKeyword} />
      </View>
      <JobTimeTypeTab value={jobTimeType} onChange={changeJobTimeType} />
      <JobFilterTabs
        jobTimeType={jobTimeType}
        filters={filters}
        onChange={next => setFilters(prev => ({ ...prev, ...next }))}
        provinces={provinceList.data?.provinces}
        artFields={artFields.data?.majorGroups}
        majorGroups={majorGroups.data?.majorGroups}
      />
      <View style={{ height: 16 }} />
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        ref={listRef}
        data={list.items}
        keyExtractor={job => String(job.id)}
        renderItem={({ item }) => (isPartTime ? <JobPartTimeCard job={item} /> : <JobCard job={item} />)}
        ItemSeparatorComponent={isPartTime ? () => <View style={{ height: 16 }} /> : undefined}
        ListHeaderComponent={header}
        ListEmptyComponent={list.isLoading ? <Loading /> : <EmptyDataMessage />}
        ListFooterComponent={list.isFetchingNextPage ? <Loading style={{ paddingVertical: 16 }} /> : undefined}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
        contentContainerStyle={{ paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
      />
      <Pressable onPress={goToCreate} style={styles.fab} accessibilityLabel="채용 등록">
        <Icon name="plus" size={22} color={colors.main} weight="semibold" />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  searchArea: { paddingHorizontal: 16, marginTop: 24, marginBottom: 16, alignItems: "center", gap: 8 },
  headline: { fontSize: 20, fontWeight: "700", color: colors.black },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
})

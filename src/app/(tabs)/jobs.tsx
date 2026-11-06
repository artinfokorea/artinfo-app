import { useQueries } from "@tanstack/react-query"
import { router, useLocalSearchParams } from "expo-router"
import React, { useMemo, useRef, useState } from "react"
import { FlatList, RefreshControl, View } from "react-native"

import { JobCard } from "@/components/jobs/JobCard"
import { JobPartTimeCard } from "@/components/jobs/JobPartTimeCard"
import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { ListPageHeader } from "@/components/ui/ListPageHeader"
import { FilterGroup, FilterSelection, ListToolbar } from "@/components/ui/ListToolbar"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { toRegionOptions } from "@/lib/regions"
import { JOB, JobTimeType, JobType, JobTypeList } from "@/types/jobs"
import { ArtType, ProfessionalFieldTypes } from "@/types/majors"

const JOB_TYPE_OPTIONS = JobTypeList.map(({ title, value }) => ({ label: title, value }))

const ListSeparator = () => <View style={{ height: 1, marginHorizontal: 16, backgroundColor: colors.surface }} />

/** 웹 app/(site)/jobs/page.tsx — 제목 + "+ 공고 등록", 검색창 + 필터(지역·유형·분야), 가벼운 목록 */
export default function JobsScreen() {
  const params = useLocalSearchParams<{ jobTimeType?: string }>()
  const requireAuth = useRequireAuth()
  const listRef = useRef<FlatList<JOB>>(null)

  // 아마추어·소년소녀 채용은 없어졌다 — 예전 링크(?jobTimeType=AMATEUR|YOUTH)는 정규직으로 보여준다 (웹 useJobTimeType)
  const isPartTime = params.jobTimeType === JobTimeType.PART_TIME

  const [keyword, setKeyword] = useState("")
  const [selected, setSelected] = useState<FilterSelection>({})

  const [artFields, provinceList] = useQueries({
    queries: [queries.majors.artFields({ artCategories: [ArtType.MUSIC] }), queries.provinces.list()],
  })

  const groups: FilterGroup[] = isPartTime
    ? []
    : [
        { param: "provinceId", name: "지역", options: toRegionOptions(provinceList.data?.provinces) },
        { param: "recruit", name: "유형", options: JOB_TYPE_OPTIONS },
        {
          param: "professional",
          name: "분야",
          options: artFields.data?.majorGroups?.map(({ nameKo, nameEn }) => ({ label: nameKo, value: nameEn })) ?? [],
        },
      ]

  const provinceIds = (selected.provinceId ?? []).map(Number)

  // 웹 components/jobs/JobList 와 같은 규칙
  const fullTimeRequest = useMemo(() => {
    const recruits = (selected.recruit ?? []) as JobType[]
    return {
      size: 10,
      types: recruits.length > 0 ? recruits : [JobType.ART_ORGANIZATION, JobType.LECTURER, JobType.RELIGION],
      keyword: keyword || undefined,
      professionalFields: (selected.professional ?? []) as ProfessionalFieldTypes[],
      provinceIds,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, selected])

  const partTimeRequest = useMemo(
    () => ({ size: 10, majorGroups: [], keyword: keyword || undefined, provinceIds: [] }),
    [keyword],
  )

  const fullTimeList = useInfiniteList<JOB, "jobs">(queries.jobs.infiniteList(fullTimeRequest), "jobs", {
    enabled: !isPartTime,
  })
  const partTimeList = useInfiniteList<JOB, "jobs">(queries.jobs.infinitePartTimeList(partTimeRequest), "jobs", {
    enabled: isPartTime,
  })
  const list = isPartTime ? partTimeList : fullTimeList

  const goToCreate = () => {
    if (!requireAuth()) return
    router.push(isPartTime ? "/jobs/part-time/create" : "/jobs/create")
  }

  const header = (
    <View style={{ marginBottom: 8 }}>
      <ListPageHeader title="채용" action={{ label: "공고 등록", onPress: goToCreate }} />
      <ListToolbar
        searchPlaceholder="기관, 제목, 전공 검색"
        keyword={keyword}
        onKeywordChange={setKeyword}
        groups={groups}
        selected={selected}
        onSelectedChange={setSelected}
      />
    </View>
  )

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        ref={listRef}
        data={list.items}
        keyExtractor={job => String(job.id)}
        renderItem={({ item }) => (isPartTime ? <JobPartTimeCard job={item} /> : <JobCard job={item} />)}
        ItemSeparatorComponent={isPartTime ? () => <View style={{ height: 16 }} /> : ListSeparator}
        ListHeaderComponent={header}
        ListEmptyComponent={
          list.isLoading ? <Loading /> : <EmptyDataMessage message="조건에 맞는 공고가 없어요. 필터를 바꿔 보세요." />
        }
        ListFooterComponent={list.isFetchingNextPage ? <Loading style={{ paddingVertical: 16 }} /> : undefined}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
        contentContainerStyle={{ paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
      />
      <FloatingButtons onScrollTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} />
    </View>
  )
}

import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useMemo, useRef, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, View } from "react-native"

import { padGrid } from "@/components/lessons/ListParts"
import { PerformanceCard } from "@/components/performances/PerformanceCard"
import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { ListPageHeader } from "@/components/ui/ListPageHeader"
import { FilterGroup, FilterSelection, ListToolbar } from "@/components/ui/ListToolbar"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { toRegionOptions } from "@/lib/regions"
import { PERFORMANCE, PerformanceCategory, performanceCategoryArray } from "@/types/performances"

const CATEGORY_OPTIONS = performanceCategoryArray.map(({ title, value }) => ({ label: title, value }))

/** 웹 app/(site)/performances/page.tsx — 제목 + "+ 공연 등록", 검색창 + 필터(지역·장르), 2열 포스터 */
export default function PerformancesScreen() {
  const requireAuth = useRequireAuth()
  const listRef = useRef<FlatList<PERFORMANCE | null>>(null)
  const [keyword, setKeyword] = useState("")
  const [selected, setSelected] = useState<FilterSelection>({})

  const provincesQuery = useQuery(queries.provinces.list())

  const groups: FilterGroup[] = [
    { param: "provinceId", name: "지역", options: toRegionOptions(provincesQuery.data?.provinces) },
    { param: "category", name: "장르", options: CATEGORY_OPTIONS },
  ]

  const filters = useMemo(
    () => ({
      size: 10,
      keyword: keyword || undefined,
      categories: (selected.category ?? []) as PerformanceCategory[],
      provinceIds: (selected.provinceId ?? []).map(Number),
    }),
    [keyword, selected],
  )

  const list = useInfiniteList<PERFORMANCE, "performances">(queries.performances.infiniteList(filters), "performances")

  const goCreate = () => {
    if (requireAuth()) router.push("/performances/create")
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        ref={listRef}
        data={padGrid(list.items)}
        keyExtractor={(item, index) => (item ? String(item.id) : `empty-${index}`)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (item ? <PerformanceCard performance={item} /> : <View style={{ flex: 1 }} />)}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ListPageHeader title="공연" action={{ label: "공연 등록", onPress: goCreate }} />
            <ListToolbar
              searchPlaceholder="공연 제목, 출연진 검색"
              keyword={keyword}
              onKeywordChange={setKeyword}
              groups={groups}
              selected={selected}
              onSelectedChange={setSelected}
            />
          </View>
        }
        ListEmptyComponent={
          list.isLoading ? <Loading /> : <EmptyDataMessage message="조건에 맞는 공연이 없어요. 필터를 바꿔 보세요." />
        }
        ListFooterComponent={list.isFetchingNextPage ? <Loading style={{ paddingVertical: 16 }} /> : undefined}
        keyboardShouldPersistTaps="handled"
      />
      <FloatingButtons onScrollTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { marginHorizontal: -16, marginBottom: 20 },
  content: { paddingHorizontal: 16, paddingBottom: 96, gap: 24 },
  row: { gap: 12 },
})

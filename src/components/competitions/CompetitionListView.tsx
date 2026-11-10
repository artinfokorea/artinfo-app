import { router } from "expo-router"
import React, { useMemo, useRef, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"

import { CompetitionCard } from "@/components/competitions/CompetitionCard"
import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { ListPageHeader } from "@/components/ui/ListPageHeader"
import { FilterGroup, FilterSelection, ListToolbar } from "@/components/ui/ListToolbar"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { COMPETITION, COMPETITION_AREAS, COMPETITION_DIVISIONS, CompetitionPhase, PHASE_OPTIONS } from "@/types/competitions"

const toOptions = (values: string[]) => values.map(value => ({ label: value === "전국" ? "전국(온라인)" : value, value }))

const GROUPS: FilterGroup[] = [
  { param: "phase", name: "상태", options: PHASE_OPTIONS },
  { param: "division", name: "부문", options: toOptions(COMPETITION_DIVISIONS) },
  { param: "area", name: "지역", options: toOptions(COMPETITION_AREAS) },
]

/**
 * 소식 탭의 콩쿠르 — 웹 app/(site)/competitions/page.tsx.
 * 검색 + 필터(상태·부문·지역) 한 줄, 포스터 카드 2열, 정렬은 서버의 마감임박순.
 */
export const CompetitionListView = () => {
  const requireAuth = useRequireAuth()
  const listRef = useRef<FlatList<COMPETITION>>(null)
  const [keyword, setKeyword] = useState("")
  const [selected, setSelected] = useState<FilterSelection>({})

  const request = useMemo(
    () => ({
      size: 20,
      keyword: keyword || undefined,
      phases: (selected.phase ?? []) as CompetitionPhase[],
      divisions: selected.division ?? [],
      areas: selected.area ?? [],
    }),
    [keyword, selected],
  )
  const list = useInfiniteList<COMPETITION, "competitions">(queries.competitions.infiniteList(request), "competitions")

  const goToCreate = () => {
    if (!requireAuth()) return
    router.push("/competitions/create")
  }

  const header = (
    <View style={{ marginBottom: 12 }}>
      <ListPageHeader title="콩쿠르" action={{ label: "콩쿠르 등록", onPress: goToCreate }} />
      <Text style={styles.lead}>전국 음악 콩쿠르 접수 일정을 한곳에서 · 마감이 가까운 순</Text>
      <ListToolbar
        searchPlaceholder="대회명, 주최, 지역 검색"
        keyword={keyword}
        onKeywordChange={setKeyword}
        groups={GROUPS}
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
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => <CompetitionCard competition={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          list.isLoading ? (
            <Loading />
          ) : list.isError ? (
            <EmptyDataMessage message="콩쿠르 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
          ) : (
            <EmptyDataMessage message="조건에 맞는 콩쿠르가 없어요. 필터를 바꿔 보세요." />
          )
        }
        ListFooterComponent={list.isFetchingNextPage ? <Loading style={{ paddingVertical: 16 }} /> : undefined}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
      />
      <FloatingButtons onScrollTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} />
    </View>
  )
}

const styles = StyleSheet.create({
  lead: { marginTop: 4, marginBottom: 8, fontSize: 13, color: colors.muted },
})

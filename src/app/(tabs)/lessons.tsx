import { useQueries } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useMemo, useRef, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, View } from "react-native"

import { LessonCard } from "@/components/lessons/LessonCard"
import { padGrid } from "@/components/lessons/ListParts"
import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { ListPageHeader } from "@/components/ui/ListPageHeader"
import { FilterGroup, FilterSelection, ListToolbar } from "@/components/ui/ListToolbar"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { toRegionOptions } from "@/lib/regions"
import { LESSON } from "@/types/lessons"
import { ProfessionalFieldTypes } from "@/types/majors"

/** 웹 app/(site)/lessons/page.tsx — 제목 + "+ 레슨 등록", 검색창 + 필터(지역·분야), 2열 카드 */
export default function LessonsScreen() {
  const requireAuth = useRequireAuth()
  const listRef = useRef<FlatList<LESSON | null>>(null)
  const [keyword, setKeyword] = useState("")
  const [selected, setSelected] = useState<FilterSelection>({})

  const [fieldsQuery, provincesQuery] = useQueries({
    queries: [queries.lessons.fields(), queries.provinces.list()],
  })

  const groups: FilterGroup[] = [
    { param: "provinceId", name: "지역", options: toRegionOptions(provincesQuery.data?.provinces) },
    {
      param: "professional",
      name: "분야",
      options: fieldsQuery.data?.majorGroups?.map(({ nameKo, nameEn }) => ({ label: nameKo, value: nameEn })) ?? [],
    },
  ]

  const filters = useMemo(
    () => ({
      size: 10,
      keyword: keyword || undefined,
      professionalFields: (selected.professional ?? []) as ProfessionalFieldTypes[],
      provinceIds: (selected.provinceId ?? []).map(Number),
    }),
    [keyword, selected],
  )

  const list = useInfiniteList<LESSON, "lessons">(queries.lessons.infiniteList(filters), "lessons")

  const goCreate = () => {
    if (requireAuth()) router.push("/lessons/create")
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
        renderItem={({ item }) => (item ? <LessonCard lesson={item} /> : <View style={{ flex: 1 }} />)}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ListPageHeader title="레슨" action={{ label: "레슨 등록", onPress: goCreate }} />
            <ListToolbar
              searchPlaceholder="이름, 전공, 지역 검색"
              keyword={keyword}
              onKeywordChange={setKeyword}
              groups={groups}
              selected={selected}
              onSelectedChange={setSelected}
            />
          </View>
        }
        ListEmptyComponent={
          list.isLoading ? <Loading /> : <EmptyDataMessage message="조건에 맞는 레슨이 없어요. 필터를 바꿔 보세요." />
        }
        ListFooterComponent={list.isFetchingNextPage ? <Loading style={{ paddingVertical: 16 }} /> : undefined}
        keyboardShouldPersistTaps="handled"
      />
      <FloatingButtons onScrollTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} />
    </View>
  )
}

const styles = StyleSheet.create({
  // 헤더는 화면 가득, 카드 그리드만 좌우 16 여백 (웹 gap-x-3 gap-y-6)
  header: { marginHorizontal: -16, marginBottom: 20 },
  content: { paddingHorizontal: 16, paddingBottom: 96, gap: 24 },
  row: { gap: 12 },
})

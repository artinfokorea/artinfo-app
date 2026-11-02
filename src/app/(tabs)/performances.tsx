import { useQueries } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useMemo, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"

import { FilterTabBar, FloatingAddButton, ListTitle, padGrid } from "@/components/lessons/ListParts"
import { PerformanceCard } from "@/components/performances/PerformanceCard"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { SearchBar } from "@/components/ui/SearchBar"
import { SelectSheet } from "@/components/ui/SelectSheet"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import {
  PERFORMANCE,
  PerformanceCategory,
  performanceCategoryArray,
  PerformanceCategoryValues,
} from "@/types/performances"

/** 웹 app/(site)/performances/page.tsx (모바일 레이아웃) */
export default function PerformancesScreen() {
  const requireAuth = useRequireAuth()
  const [keyword, setKeyword] = useState("")
  const [provinceId, setProvinceId] = useState<number | null>(null)
  const [category, setCategory] = useState<PerformanceCategory | null>(null)
  const [sheet, setSheet] = useState<"region" | "category" | null>(null)

  const [provincesQuery, countQuery] = useQueries({
    queries: [queries.provinces.list(), queries.performances.count()],
  })
  const provinces = provincesQuery.data?.provinces ?? []

  const filters = useMemo(
    () => ({
      size: 10,
      keyword: keyword || undefined,
      categories: category ? [category] : [],
      provinceIds: provinceId ? [provinceId] : [],
    }),
    [keyword, category, provinceId],
  )

  const list = useInfiniteList<PERFORMANCE, "performances">(
    queries.performances.infiniteList(filters),
    "performances",
  )

  const selectedProvince = provinces.find(p => p.id === provinceId)

  const goCreate = () => {
    if (requireAuth()) router.push("/performances/create")
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        data={padGrid(list.items)}
        keyExtractor={(item, index) => (item ? String(item.id) : `empty-${index}`)}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={styles.content}
        renderItem={({ item }) =>
          item ? <PerformanceCard performance={item} /> : <View style={{ flex: 1 }} />
        }
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <ListTitle>
              기대되는 공연 <Text style={{ color: colors.main }}>{countQuery.data?.totalCount ?? ""}</Text>
            </ListTitle>
            <SearchBar
              value={keyword}
              onSubmit={setKeyword}
              placeholder="제목, 출연진 등을 검색해보세요."
            />
            <FilterTabBar
              tabs={[
                {
                  key: "region",
                  label: selectedProvince ? selectedProvince.name.substring(0, 2) : "지역",
                  active: !!selectedProvince,
                  onPress: () => setSheet("region"),
                },
                {
                  key: "category",
                  label: category ? PerformanceCategoryValues[category] : "분야",
                  active: !!category,
                  onPress: () => setSheet("category"),
                },
              ]}
            />
          </View>
        }
        ListEmptyComponent={list.isLoading ? <Loading /> : <EmptyDataMessage />}
        ListFooterComponent={
          list.isFetchingNextPage ? <Loading style={{ paddingVertical: 16 }} /> : undefined
        }
      />
      <FloatingAddButton onPress={goCreate} />

      <SelectSheet<number | null>
        visible={sheet === "region"}
        title="지역"
        options={[
          { label: "전체", value: null },
          ...provinces.map(p => ({ label: p.name, value: p.id as number | null })),
        ]}
        selected={[provinceId]}
        onClose={() => setSheet(null)}
        onConfirm={([value]) => setProvinceId(value ?? null)}
      />
      <SelectSheet<PerformanceCategory | null>
        visible={sheet === "category"}
        title="분야"
        options={[
          { label: "전체", value: null },
          ...performanceCategoryArray.map(c => ({
            label: c.title,
            value: c.value as PerformanceCategory | null,
          })),
        ]}
        selected={[category]}
        onClose={() => setSheet(null)}
        onConfirm={([value]) => setCategory(value ?? null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 96, gap: 8 },
})

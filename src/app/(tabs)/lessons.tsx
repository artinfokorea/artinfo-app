import { useQueries } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useMemo, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"

import { LessonCard } from "@/components/lessons/LessonCard"
import { FilterTabBar, FloatingAddButton, ListTitle, padGrid } from "@/components/lessons/ListParts"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { SearchBar } from "@/components/ui/SearchBar"
import { SelectSheet } from "@/components/ui/SelectSheet"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { LESSON } from "@/types/lessons"
import { ProfessionalFieldTypes } from "@/types/majors"

/** 웹 app/(site)/lessons/page.tsx (모바일 레이아웃) */
export default function LessonsScreen() {
  const requireAuth = useRequireAuth()
  const [keyword, setKeyword] = useState("")
  const [provinceId, setProvinceId] = useState<number | null>(null)
  const [professional, setProfessional] = useState<ProfessionalFieldTypes | null>(null)
  const [sheet, setSheet] = useState<"region" | "major" | null>(null)

  const [fieldsQuery, provincesQuery, countQuery] = useQueries({
    queries: [queries.lessons.fields(), queries.provinces.list(), queries.lessons.count()],
  })

  const fields = fieldsQuery.data?.majorGroups ?? []
  const provinces = provincesQuery.data?.provinces ?? []

  const filters = useMemo(
    () => ({
      size: 10,
      keyword: keyword || undefined,
      professionalFields: professional ? [professional] : [],
      provinceIds: provinceId ? [provinceId] : [],
    }),
    [keyword, professional, provinceId],
  )

  const list = useInfiniteList<LESSON, "lessons">(
    queries.lessons.infiniteList(filters),
    "lessons",
  )

  const selectedProvince = provinces.find(p => p.id === provinceId)
  const selectedField = fields.find(f => f.nameEn === professional)

  const goCreate = () => {
    if (requireAuth()) router.push("/lessons/create")
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <FlatList
        data={padGrid(list.items)}
        keyExtractor={(item, index) => (item ? String(item.id) : `empty-${index}`)}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (item ? <LessonCard lesson={item} /> : <View style={{ flex: 1 }} />)}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <ListTitle>
              <Text style={{ color: colors.main }}>{countQuery.data?.totalCount || "00"}</Text>
              명의 전문가가 준비중이에요.
            </ListTitle>
            <SearchBar value={keyword} onSubmit={setKeyword} />
            <FilterTabBar
              tabs={[
                {
                  key: "region",
                  label: selectedProvince ? selectedProvince.name.substring(0, 2) : "지역",
                  active: !!selectedProvince,
                  onPress: () => setSheet("region"),
                },
                {
                  key: "major",
                  label: selectedField ? selectedField.nameKo : "분야",
                  active: !!selectedField,
                  onPress: () => setSheet("major"),
                },
              ]}
            />
          </View>
        }
        ListEmptyComponent={list.isLoading ? <Loading /> : <EmptyDataMessage />}
        ListFooterComponent={list.isFetchingNextPage ? <Loading style={{ paddingVertical: 16 }} /> : undefined}
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
      <SelectSheet<ProfessionalFieldTypes | null>
        visible={sheet === "major"}
        title="분야"
        options={[
          { label: "전체", value: null },
          ...fields.map(f => ({
            label: f.nameKo,
            value: f.nameEn as ProfessionalFieldTypes | null,
          })),
        ]}
        selected={[professional]}
        onClose={() => setSheet(null)}
        onConfirm={([value]) => setProfessional(value ?? null)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 96, gap: 16 },
})

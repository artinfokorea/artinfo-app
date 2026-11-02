import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useRef, useState } from "react"
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native"

import { NewsCard } from "@/components/news/NewsCard"
import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { SearchBar } from "@/components/ui/SearchBar"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { NEWS } from "@/types/news"
import { UserType } from "@/types/users"

/** 웹 app/(site)/news/page.tsx */
export const NewsListView = () => {
  const [keyword, setKeyword] = useState("")
  const listRef = useRef<FlatList<NEWS>>(null)
  const { user } = useAuth()

  const { data: newsCount } = useQuery(queries.news.count())

  const list = useInfiniteList<NEWS, "news">(
    // query-key-factory 타입이 queryFn 을 숨겨서 캐스팅 (런타임에는 존재)
    queries.news.infiniteList({ size: 10, keyword: keyword || undefined }) as any,
    "news",
  )

  const isAdmin = user?.type === UserType.ADMIN

  const header = (
    <View style={styles.searchArea}>
      <Text style={styles.headline}>
        아트인포 예술 뉴스 <Text style={{ color: colors.main }}>{newsCount?.totalCount || "00"}</Text>
      </Text>
      <SearchBar value={keyword} onSubmit={setKeyword} />
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={list.items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <NewsCard news={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={list.isLoading ? <Loading /> : <EmptyDataMessage />}
        ListFooterComponent={list.isFetchingNextPage ? <Loading /> : <View style={{ height: 96 }} />}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
      />
      <FloatingButtons
        onScrollTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
        onAdd={isAdmin ? () => router.push("/news/create") : undefined}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  searchArea: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8, gap: 10, alignItems: "center" },
  headline: { fontSize: 20, fontWeight: "700", color: colors.black },
})

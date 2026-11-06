import { router } from "expo-router"
import React, { useRef, useState } from "react"
import { FlatList, RefreshControl, View } from "react-native"

import { NewsCard } from "@/components/news/NewsCard"
import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { ListPageHeader } from "@/components/ui/ListPageHeader"
import { ListToolbar } from "@/components/ui/ListToolbar"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { NEWS } from "@/types/news"
import { UserType } from "@/types/users"

const ListSeparator = () => <View style={{ height: 1, marginHorizontal: 16, backgroundColor: colors.surface }} />

/** 웹 app/(site)/news/page.tsx — 제목 (+ 관리자만 "뉴스 등록"), 검색창, 가벼운 목록 */
export const NewsListView = () => {
  const [keyword, setKeyword] = useState("")
  const listRef = useRef<FlatList<NEWS>>(null)
  const { user } = useAuth()

  const list = useInfiniteList<NEWS, "news">(
    // query-key-factory 타입이 queryFn 을 숨겨서 캐스팅 (런타임에는 존재)
    queries.news.infiniteList({ size: 10, keyword: keyword || undefined }) as any,
    "news",
  )

  const isAdmin = user?.type === UserType.ADMIN

  const header = (
    <View style={{ marginBottom: 8 }}>
      <ListPageHeader
        title="뉴스"
        action={isAdmin ? { label: "뉴스 등록", onPress: () => router.push("/news/create") } : undefined}
      />
      <ListToolbar searchPlaceholder="뉴스 제목, 내용 검색" keyword={keyword} onKeywordChange={setKeyword} />
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={list.items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <NewsCard news={item} />}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={header}
        ListEmptyComponent={list.isLoading ? <Loading /> : <EmptyDataMessage message="검색 결과가 없어요." />}
        ListFooterComponent={list.isFetchingNextPage ? <Loading /> : <View style={{ height: 96 }} />}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.5}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={list.refreshing} onRefresh={list.refresh} />}
      />
      <FloatingButtons onScrollTop={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} />
    </View>
  )
}

import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useRef, useState } from "react"
import { FlatList, RefreshControl, View } from "react-native"

import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { PostCard } from "@/components/posts/PostCard"
import { TopPosts } from "@/components/posts/TopPosts"
import { ListPageHeader } from "@/components/ui/ListPageHeader"
import { FilterGroup, FilterSelection, ListToolbar } from "@/components/ui/ListToolbar"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useBlockedUserIds } from "@/hooks/useModeration"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { Post, PostCategory, PostCategoryLabel } from "@/types/posts"

// API 가 카테고리를 하나만 받는다
const CATEGORY_GROUPS: FilterGroup[] = [
  {
    param: "category",
    name: "카테고리",
    options: Object.entries(PostCategoryLabel).map(([value, label]) => ({ label, value })),
    single: true,
  },
]

const ListSeparator = () => <View style={{ height: 1, marginHorizontal: 16, backgroundColor: colors.surface }} />

/** 웹 app/(site)/posts/page.tsx — 제목 + "+ 글쓰기", 검색창 + 카테고리 필터, 인기 글 박스, 가벼운 목록 */
export const PostListView = () => {
  const [keyword, setKeyword] = useState("")
  const [selected, setSelected] = useState<FilterSelection>({})
  const listRef = useRef<FlatList<Post>>(null)
  const requireAuth = useRequireAuth()
  const blockedUserIds = useBlockedUserIds()

  const category = selected.category?.[0] as PostCategory | undefined

  const { data: popularPosts } = useQuery(queries.posts.popular())

  const list = useInfiniteList<Post, "posts">(
    // query-key-factory 타입이 queryFn 을 숨겨서 캐스팅 (런타임에는 존재)
    queries.posts.infiniteList({ size: 10, keyword: keyword || undefined, category }) as any,
    "posts",
  )

  const header = (
    <View style={{ marginBottom: 8 }}>
      <ListPageHeader
        title="나눔"
        action={{ label: "글쓰기", onPress: () => requireAuth() && router.push("/posts/create") }}
      />
      <ListToolbar
        searchPlaceholder="제목, 내용, 글쓴이 검색"
        keyword={keyword}
        onKeywordChange={setKeyword}
        groups={CATEGORY_GROUPS}
        selected={selected}
        onSelectedChange={setSelected}
      />
      <TopPosts posts={popularPosts?.posts} />
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={list.items.filter(post => !blockedUserIds.has(post.authorId))}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <PostCard post={item} />}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={header}
        ListEmptyComponent={list.isLoading ? <Loading /> : <EmptyDataMessage message="조건에 맞는 글이 없어요." />}
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

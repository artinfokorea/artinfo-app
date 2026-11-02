import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React, { useRef, useState } from "react"
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native"

import { PostCard } from "@/components/posts/PostCard"
import { TopPostsModal } from "@/components/posts/TopPostsModal"
import { FloatingButtons } from "@/components/posts/FloatingButtons"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { SearchBar } from "@/components/ui/SearchBar"
import { colors } from "@/constants/theme"
import { useInfiniteList } from "@/hooks/useInfiniteList"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { Post, PostCategory, PostCategoryLabel } from "@/types/posts"

/** 웹 app/(site)/posts/page.tsx (모바일 레이아웃) */
export const PostListView = () => {
  const [keyword, setKeyword] = useState("")
  const [category, setCategory] = useState<PostCategory | undefined>()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isTopPostsOpen, setIsTopPostsOpen] = useState(false)
  const listRef = useRef<FlatList<Post>>(null)
  const requireAuth = useRequireAuth()

  const { data: popularPosts } = useQuery(queries.posts.popular())

  const list = useInfiniteList<Post, "posts">(
    // query-key-factory 타입이 queryFn 을 숨겨서 캐스팅 (런타임에는 존재)
    queries.posts.infiniteList({ size: 10, keyword: keyword || undefined, category }) as any,
    "posts",
  )

  const selectCategory = (next: PostCategory | "ALL") => {
    setCategory(next === "ALL" ? undefined : next)
    setIsFilterOpen(false)
  }

  const header = (
    <View>
      <View style={styles.searchArea}>
        <Text style={styles.headline}>여러분의 이야기를 나누어주세요.</Text>
        <SearchBar
          value={keyword}
          onSubmit={setKeyword}
          placeholder="제목, 내용, 글쓴이 등을 검색해보세요."
        />
      </View>

      {/* 웹 PostMobileFilterTabs */}
      <View style={styles.filterBox}>
        <View style={styles.filterTabs}>
          <Pressable
            style={[styles.filterTab, isFilterOpen && { backgroundColor: colors.whitesmoke }]}
            onPress={() => setIsFilterOpen(prev => !prev)}
          >
            <Text style={styles.filterTabText}>
              나눔{category ? ` · ${PostCategoryLabel[category]}` : ""}
            </Text>
          </Pressable>
          <Pressable style={styles.filterTab} onPress={() => setIsTopPostsOpen(true)}>
            <Text style={styles.filterTabText}>Top Stories</Text>
          </Pressable>
        </View>
        {isFilterOpen ? (
          <View style={styles.categoryList}>
            {(["ALL", ...Object.values(PostCategory)] as const).map(key => {
              const selected = key === "ALL" ? !category : category === key
              return (
                <Pressable key={key} style={styles.categoryItem} onPress={() => selectCategory(key)}>
                  <Text style={[styles.categoryText, selected && { color: colors.main }]}>
                    {key === "ALL" ? "전체" : PostCategoryLabel[key]}
                  </Text>
                </Pressable>
              )
            })}
          </View>
        ) : null}
      </View>
    </View>
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={list.items}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => <PostCard post={item} />}
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
        onAdd={() => requireAuth() && router.push("/posts/create")}
      />
      <TopPostsModal
        visible={isTopPostsOpen}
        posts={popularPosts?.posts}
        onClose={() => setIsTopPostsOpen(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  searchArea: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 16, gap: 10, alignItems: "center" },
  headline: { fontSize: 17, fontWeight: "700", color: colors.black },
  filterBox: {
    marginHorizontal: 16,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 4,
  },
  filterTabs: { flexDirection: "row" },
  filterTab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 4 },
  filterTabText: { fontSize: 14, color: colors.main },
  categoryList: { paddingHorizontal: 8, paddingVertical: 12, gap: 2 },
  categoryItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  categoryText: { fontWeight: "600", color: colors.coolgray, fontSize: 15 },
})

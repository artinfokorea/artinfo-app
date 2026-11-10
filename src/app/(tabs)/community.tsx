import { router, useLocalSearchParams } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { CompetitionListView } from "@/components/competitions/CompetitionListView"
import { NewsListView } from "@/components/news/NewsListView"
import { PostListView } from "@/components/posts/PostListView"
import { colors } from "@/constants/theme"

type CommunityTab = "posts" | "competitions" | "news"

const TABS: { key: CommunityTab; label: string; isNew?: boolean }[] = [
  { key: "posts", label: "나눔" },
  { key: "competitions", label: "콩쿠르", isNew: true },
  { key: "news", label: "뉴스" },
]

/** 하단 탭 "소식" — 나눔 · 콩쿠르 · 뉴스 (웹 모바일 NewsTabs 와 같은 구성). ?tab=competitions 로 바로 열 수 있다 */
export default function CommunityScreen() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const tab: CommunityTab = params.tab === "news" ? "news" : params.tab === "competitions" ? "competitions" : "posts"

  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <View style={styles.tabs}>
        {TABS.map(item => {
          const active = item.key === tab
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => router.setParams({ tab: item.key })}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 3 }}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
                {item.isNew && !active ? <View style={styles.newDot} accessibilityLabel="새 메뉴" /> : null}
              </View>
            </Pressable>
          )
        })}
      </View>
      {tab === "posts" ? <PostListView /> : tab === "competitions" ? <CompetitionListView /> : <NewsListView />}
    </View>
  )
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginBottom: -1,
  },
  tabActive: { borderBottomColor: colors.main },
  tabText: { fontSize: 16, fontWeight: "600", color: colors.gray500 },
  tabTextActive: { color: colors.main, fontWeight: "700" },
  newDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.main, marginTop: 2 },
})

import { router, useLocalSearchParams } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { NewsListView } from "@/components/news/NewsListView"
import { PostListView } from "@/components/posts/PostListView"
import { colors } from "@/constants/theme"

type CommunityTab = "posts" | "news"

const TABS: { key: CommunityTab; label: string }[] = [
  { key: "posts", label: "나눔" },
  { key: "news", label: "뉴스" },
]

/** 웹 하단 네비게이션 "소통" 메뉴(나눔 / 뉴스) */
export default function CommunityScreen() {
  const params = useLocalSearchParams<{ tab?: string }>()
  const tab: CommunityTab = params.tab === "news" ? "news" : "posts"

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
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
            </Pressable>
          )
        })}
      </View>
      {tab === "posts" ? <PostListView /> : <NewsListView />}
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
})

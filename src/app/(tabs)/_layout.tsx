import { Tabs } from "expo-router"
import React from "react"
import { Platform } from "react-native"

import { AppHeader } from "@/components/layout/AppHeader"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

/**
 * 탭 아이콘 크기. Android 의 Ionicons 채움 글리프는 SF Symbols 와 달리 상자를 꽉 채워 같은 수치면 훨씬 커 보인다
 * (Icon 이 벡터 아이콘을 1.1배 키우는 것까지 겹침) → Android 는 작게 준다.
 */
const TAB_ICON_SIZE = Platform.select({ ios: 22, default: 18 })

/**
 * 하단 탭: 홈 · 채용 · 소식(나눔·콩쿠르·뉴스) · 레슨 · 공연 — 웹 모바일 BottomNavigation 과 같은 구성.
 * 문의/내 정보는 헤더 햄버거 메뉴(/menu).
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: colors.main,
        tabBarInactiveTintColor: colors.gray500,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
        sceneStyle: { backgroundColor: colors.white },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "홈",
          tabBarIcon: ({ color }) => <Icon name="house.fill" color={color} size={TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "채용",
          tabBarIcon: ({ color }) => <Icon name="briefcase.fill" color={color} size={TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "소식",
          tabBarIcon: ({ color }) => <Icon name="newspaper.fill" color={color} size={TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: "레슨",
          tabBarIcon: ({ color }) => <Icon name="book.fill" color={color} size={TAB_ICON_SIZE} />,
        }}
      />
      <Tabs.Screen
        name="performances"
        options={{
          title: "공연",
          tabBarIcon: ({ color }) => <Icon name="calendar" color={color} size={TAB_ICON_SIZE} />,
        }}
      />
    </Tabs>
  )
}

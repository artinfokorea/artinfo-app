import { Tabs } from "expo-router"
import React from "react"

import { AppHeader } from "@/components/layout/AppHeader"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

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
          tabBarIcon: ({ color }) => <Icon name="house.fill" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: "채용",
          tabBarIcon: ({ color }) => <Icon name="briefcase.fill" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: "소식",
          tabBarIcon: ({ color }) => <Icon name="newspaper.fill" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: "레슨",
          tabBarIcon: ({ color }) => <Icon name="book.fill" color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="performances"
        options={{
          title: "공연",
          tabBarIcon: ({ color }) => <Icon name="calendar" color={color} size={22} />,
        }}
      />
    </Tabs>
  )
}

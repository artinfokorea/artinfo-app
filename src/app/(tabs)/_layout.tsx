import { Tabs } from "expo-router"
import React from "react"

import { AppHeader } from "@/components/layout/AppHeader"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

/**
 * 웹 하단 네비게이션(BottomNavigation): 채용 · 뉴스 · 나눔 · 레슨 · 공연.
 * 앱에서는 홈 탭을 추가하고 뉴스·나눔을 소통 탭으로 묶었으며, 문의/내 정보는 헤더 햄버거 메뉴(/menu)로 옮겼다.
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
          title: "소통",
          tabBarIcon: ({ color }) => (
            <Icon name="bubble.left.and.bubble.right.fill" color={color} size={22} />
          ),
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

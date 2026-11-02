import { Href, router } from "expo-router"
import React from "react"
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { Separator } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"

const MENUS: { label: string; href: Href; tab?: boolean }[] = [
  { label: "채용", href: "/jobs", tab: true },
  { label: "나눔", href: "/community?tab=posts", tab: true },
  { label: "레슨", href: "/lessons", tab: true },
  { label: "공연", href: "/performances", tab: true },
  { label: "뉴스", href: "/community?tab=news", tab: true },
  { label: "기획", href: "/performance-inquiry" },
  { label: "문의", href: "/inquiry" },
]

/** 웹 components/layouts/MobileDropDown (햄버거 메뉴) */
export default function MenuScreen() {
  const { isLoggedIn, user, signOut } = useAuth()

  const go = (href: Href, tab?: boolean) => {
    router.back()
    if (tab) router.navigate(href)
    else router.push(href)
  }

  const handleSign = () => {
    if (!isLoggedIn) {
      go("/auth/sign-in")
      return
    }
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut()
          router.back()
        },
      },
    ])
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoggedIn && user ? (
        <Pressable style={styles.profile} onPress={() => go("/my-profile")}>
          <FallbackImage src={user.iconImageUrl} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user.nickname || user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>
          <Icon name="chevron.right" size={14} color={colors.gray400} />
        </Pressable>
      ) : null}

      {MENUS.map(menu => (
        <Pressable key={menu.label} style={styles.item} onPress={() => go(menu.href, menu.tab)}>
          <Text style={styles.itemText}>{menu.label}</Text>
        </Pressable>
      ))}

      <Separator style={{ marginVertical: 16, backgroundColor: colors.whitesmoke }} />

      <Pressable style={styles.item} onPress={() => (isLoggedIn ? go("/my-profile") : go("/auth/sign-in"))}>
        <Text style={styles.itemText}>내 정보</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => (isLoggedIn ? go("/my-activities") : go("/auth/sign-in"))}>
        <Text style={styles.itemText}>내 활동</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={handleSign}>
        <Text style={[styles.itemText, { fontWeight: "800" }]}>
          {isLoggedIn ? "로그아웃" : "로그인"}
        </Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.gray50,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { fontSize: 16, fontWeight: "700", color: colors.black },
  email: { fontSize: 13, color: colors.gray500, marginTop: 2 },
  item: { paddingVertical: 12 },
  itemText: { fontSize: 17, fontWeight: "600", color: colors.gray900 },
})

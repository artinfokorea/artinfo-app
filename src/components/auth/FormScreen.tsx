import { router } from "expo-router"
import React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native"

import { colors } from "@/constants/theme"

type Props = {
  children: React.ReactNode
  /** 상단에 ARTINFO 로고(웹 인증 화면 상단 h2)를 보여준다 */
  showLogo?: boolean
  contentStyle?: StyleProp<ViewStyle>
}

/** 키보드를 피하면서 스크롤되는 폼 화면 레이아웃 */
export const FormScreen = ({ children, showLogo, contentStyle }: Props) => (
  <KeyboardAvoidingView
    style={{ flex: 1, backgroundColor: colors.white }}
    behavior={Platform.OS === "ios" ? "padding" : undefined}
    keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
  >
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={[styles.content, contentStyle]}
    >
      {showLogo ? (
        <Pressable onPress={() => router.navigate("/")} style={{ alignSelf: "center" }}>
          <Text style={styles.logo}>ARTINFO</Text>
        </Pressable>
      ) : null}
      {children}
    </ScrollView>
  </KeyboardAvoidingView>
)

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 64, gap: 16 },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.main,
    textAlign: "center",
    marginTop: 24,
    marginBottom: 32,
  },
})

import React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors } from "@/constants/theme"

type Props = {
  children: React.ReactNode
  /** 상단에 ARTINFO 로고(웹 인증 화면 상단 h2)를 보여준다 */
  showLogo?: boolean
  /** 헤더 없는 화면(로그인)에서 상태바 아래로 내용을 내리고 세로 가운데에 둔다 */
  standalone?: boolean
  contentStyle?: StyleProp<ViewStyle>
}

/** 키보드를 피하면서 스크롤되는 폼 화면 레이아웃 */
export const FormScreen = ({ children, showLogo, standalone, contentStyle }: Props) => {
  const insets = useSafeAreaInsets()
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.white }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? (standalone ? 0 : 100) : 0}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={[
          styles.content,
          standalone && {
            flexGrow: 1,
            justifyContent: "center",
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 48,
          },
          contentStyle,
        ]}
      >
        {/* 로그인 벽이라 로고를 눌러도 갈 곳이 없다 — 눌리지 않는 글자로만 둔다 */}
        {showLogo ? <Text style={styles.logo}>ARTINFO</Text> : null}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

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

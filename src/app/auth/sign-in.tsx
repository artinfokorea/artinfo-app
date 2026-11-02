import { yupResolver } from "@hookform/resolvers/yup"
import { useQueryClient } from "@tanstack/react-query"
import { Image } from "expo-image"
import { router, Stack } from "expo-router"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
import * as yup from "yup"

import {
  ControlledField,
  emailInputProps,
  passwordInputProps,
} from "@/components/auth/ControlledField"
import { FormScreen } from "@/components/auth/FormScreen"
import { Button } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import { signInWithEmail } from "@/lib/auth-store"
import { queries } from "@/lib/queries"
import { signInSchema } from "@/lib/schemas"

type FormData = yup.InferType<typeof signInSchema>

const leaveAuthScreen = () => {
  if (router.canGoBack()) router.back()
  else router.replace("/")
}

/** 웹 components/auth/SignInForm */
export default function SignInScreen() {
  const queryClient = useQueryClient()
  const { isLoggedIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(signInSchema),
  })

  // 웹: 이미 로그인 상태면 sign-in 페이지에서 / 로 보낸다
  useEffect(() => {
    if (isLoggedIn && !isLoading) leaveAuthScreen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn])

  const handleSignIn = async ({ email, password }: FormData) => {
    setErrorMessage("")
    setIsLoading(true)
    try {
      await signInWithEmail(email, password)
      await queryClient.invalidateQueries({ queryKey: queries.users._def })
      leaveAuthScreen()
    } catch {
      setErrorMessage("이메일 또는 비밀번호가 잘못되었습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  // 웹의 간편로그인은 artinfokorea.com/auth/callback 으로 리다이렉트되는 OAuth 흐름이라
  // 앱에서 쓰려면 앱용 리다이렉트 URI 등록이 필요하다.
  const handleSnsLogin = (provider: string) => {
    Alert.alert(`${provider} 로그인`, "앱에서는 간편로그인을 준비 중입니다.\n이메일로 로그인해주세요.")
  }

  return (
    <FormScreen showLogo>
      <Stack.Screen options={{ title: "로그인" }} />
      <ControlledField
        control={control}
        name="email"
        label="이메일"
        placeholder="이메일을 입력하세요."
        {...emailInputProps}
      />
      <ControlledField
        control={control}
        name="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요."
        returnKeyType="go"
        onSubmitEditing={() => handleSubmit(handleSignIn)()}
        {...passwordInputProps}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Button
        title="로그인"
        loading={isLoading}
        onPress={() => handleSubmit(handleSignIn)()}
        style={{ marginTop: 8 }}
      />

      <View style={{ alignItems: "center", gap: 10, marginTop: 4 }}>
        <Text style={{ color: colors.primary }}>
          아직 회원이 아니신가요?
          <Text style={{ color: colors.main }} onPress={() => router.push("/auth/sign-up")}>
            {" "}
            회원가입
          </Text>
        </Text>
        <Pressable onPress={() => router.push("/auth/find-password")} hitSlop={6}>
          <Text style={{ color: colors.main }}>비밀번호 찾기</Text>
        </Pressable>
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>간편로그인</Text>
        <View style={styles.divider} />
      </View>

      <View style={styles.snsRow}>
        <Pressable
          style={[styles.snsButton, { backgroundColor: colors.white }]}
          onPress={() => handleSnsLogin("구글")}
          accessibilityLabel="구글 로그인"
        >
          <Image source={require("@/assets/images/google_logo.png")} style={styles.snsLogo} contentFit="contain" />
        </Pressable>
        <Pressable
          style={[styles.snsButton, { backgroundColor: colors.naver }]}
          onPress={() => handleSnsLogin("네이버")}
          accessibilityLabel="네이버 로그인"
        >
          <Image source={require("@/assets/images/naver_logo.png")} style={styles.snsLogoFill} contentFit="cover" />
        </Pressable>
        <Pressable
          style={[styles.snsButton, { backgroundColor: colors.kakao }]}
          onPress={() => handleSnsLogin("카카오")}
          accessibilityLabel="카카오 로그인"
        >
          <Image source={require("@/assets/images/kakao_logo.png")} style={styles.snsLogo} contentFit="contain" />
        </Pressable>
      </View>
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  error: { color: colors.error, fontSize: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  divider: { flex: 1, height: 2, backgroundColor: "#CBCBCB" },
  dividerText: { marginHorizontal: 16, fontWeight: "600", color: "#CBCBCB" },
  snsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 200,
    alignSelf: "center",
    marginTop: 8,
  },
  snsButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  snsLogo: { width: 40, height: 40 },
  snsLogoFill: { width: 48, height: 48 },
})

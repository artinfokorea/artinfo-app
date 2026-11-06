import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "@tanstack/react-query";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as yup from "yup";

import {
  ControlledField,
  emailInputProps,
  passwordInputProps,
} from "@/components/auth/ControlledField";
import { FormScreen } from "@/components/auth/FormScreen";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/primitives";
import { colors } from "@/constants/theme";
import { useAuth } from "@/lib/auth";
import { signInWithEmail } from "@/lib/auth-store";
import { queries } from "@/lib/queries";
import { signInSchema } from "@/lib/schemas";
import { SNS_LABEL, SnsProvider, signInWithSnsProvider } from "@/lib/sns-login";

type FormData = yup.InferType<typeof signInSchema>;

/** 네이버 개발자센터에 앱용 Callback URL 을 아직 등록하지 않아 버튼을 잠시 숨긴다 (코드는 유지) */
const SHOW_NAVER_LOGIN = false;

/** 로그인 화면은 어디서든 열리므로, 끝나면 왔던 화면으로 돌아가고 돌아갈 곳이 없으면 홈으로 간다 */
const leaveAuthScreen = () =>
  router.canGoBack() ? router.back() : router.replace("/");

/** 웹 components/auth/SignInForm */
export default function SignInScreen() {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [snsLoading, setSnsLoading] = useState<SnsProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const insets = useSafeAreaInsets();

  // 심사 지침 4.8: 다른 SNS 로그인을 제공하면 Apple 로그인도 제공해야 한다 (iOS 13+ 에서만 노출)
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    AppleAuthentication.isAvailableAsync()
      .then(setIsAppleAvailable)
      .catch(() => setIsAppleAvailable(false));
  }, []);

  const { control, handleSubmit } = useForm<FormData>({
    resolver: yupResolver(signInSchema),
  });

  // 웹: 이미 로그인 상태면 sign-in 페이지에서 / 로 보낸다
  useEffect(() => {
    if (isLoggedIn && !isLoading) leaveAuthScreen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSignIn = async ({ email, password }: FormData) => {
    setErrorMessage("");
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      await queryClient.invalidateQueries({ queryKey: queries.users._def });
      leaveAuthScreen();
    } catch {
      setErrorMessage("이메일 또는 비밀번호가 잘못되었습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  /** 구글·네이버: 시스템 브라우저 OAuth → 웹 중계 페이지 → 앱 복귀 → 서버 /auths/login/sns */
  const handleSnsLogin = async (provider: SnsProvider) => {
    if (snsLoading) return;
    setErrorMessage("");
    setSnsLoading(provider);
    try {
      const result = await signInWithSnsProvider(provider);
      if (result === "success") {
        await queryClient.invalidateQueries({ queryKey: queries.users._def });
        leaveAuthScreen();
      }
    } catch (error: any) {
      setErrorMessage(
        error?.message ?? `${SNS_LABEL[provider]} 로그인에 실패했습니다.`,
      );
    } finally {
      setSnsLoading(null);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={leaveAuthScreen}
        style={[styles.close, { top: insets.top + 8 }]}
        hitSlop={10}
        accessibilityLabel="닫기"
      >
        <Icon name="xmark" size={20} color={colors.gray700} />
      </Pressable>
      <FormScreen showLogo standalone>
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
            <Text
              style={{ color: colors.main }}
              onPress={() => router.push("/auth/sign-up")}
            >
              {" "}
              회원가입
            </Text>
          </Text>
          <Pressable
            onPress={() => router.push("/auth/find-password")}
            hitSlop={6}
          >
            <Text style={{ color: colors.main }}>비밀번호 찾기</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>간편로그인</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.snsRow}>
          {/* Apple 로고만 있는 정사각형 버튼(HIG 허용형) — 다른 SNS 버튼과 같은 크기로 맞춘다 */}
          {isAppleAvailable ? (
            <Pressable
              style={[
                styles.snsButton,
                {
                  backgroundColor: colors.black,
                  opacity: snsLoading === "APPLE" ? 0.5 : 1,
                },
              ]}
              onPress={() => handleSnsLogin("APPLE")}
              accessibilityLabel="Apple로 로그인"
            >
              <Icon name="apple.logo" size={26} color={colors.white} />
            </Pressable>
          ) : null}
          <Pressable
            style={[
              styles.snsButton,
              {
                backgroundColor: colors.white,
                opacity: snsLoading === "GOOGLE" ? 0.5 : 1,
              },
            ]}
            onPress={() => handleSnsLogin("GOOGLE")}
            accessibilityLabel="구글 로그인"
          >
            <Image
              source={require("@/assets/images/google_logo.png")}
              style={styles.snsLogo}
              contentFit="contain"
            />
          </Pressable>
          {SHOW_NAVER_LOGIN ? (
            <Pressable
              style={[
                styles.snsButton,
                {
                  backgroundColor: colors.naver,
                  opacity: snsLoading === "NAVER" ? 0.5 : 1,
                },
              ]}
              onPress={() => handleSnsLogin("NAVER")}
              accessibilityLabel="네이버 로그인"
            >
              <Image
                source={require("@/assets/images/naver_logo.png")}
                style={styles.snsLogoFill}
                contentFit="cover"
              />
            </Pressable>
          ) : null}
          <Pressable
            style={[
              styles.snsButton,
              {
                backgroundColor: colors.kakao,
                opacity: snsLoading === "KAKAO" ? 0.5 : 1,
              },
            ]}
            onPress={() => handleSnsLogin("KAKAO")}
            accessibilityLabel="카카오 로그인"
          >
            <Image
              source={require("@/assets/images/kakao_logo.png")}
              style={styles.snsLogo}
              contentFit="contain"
            />
          </Pressable>
        </View>
      </FormScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  close: { position: "absolute", right: 16, zIndex: 1, padding: 6 },
  error: { color: colors.error, fontSize: 12 },
  dividerRow: { flexDirection: "row", alignItems: "center", marginTop: 16 },
  divider: { flex: 1, height: 2, backgroundColor: "#CBCBCB" },
  dividerText: { marginHorizontal: 16, fontWeight: "600", color: "#CBCBCB" },
  snsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    alignSelf: "center",
    marginTop: 12,
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
});

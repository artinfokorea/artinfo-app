import * as AppleAuthentication from "expo-apple-authentication"
import * as WebBrowser from "expo-web-browser"

import {
  APP_AUTH_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  KAKAO_REST_API_KEY,
  NAVER_CLIENT_ID,
  SNS_REDIRECT_URL,
} from "@/constants/config"
import { signInWithSns } from "@/lib/auth-store"

export type SnsProvider = "GOOGLE" | "NAVER" | "KAKAO" | "APPLE"

export const SNS_LABEL: Record<SnsProvider, string> = {
  GOOGLE: "구글",
  NAVER: "네이버",
  KAKAO: "카카오",
  APPLE: "Apple",
}

const randomState = (provider: Exclude<SnsProvider, "APPLE">) =>
  `${provider.toLowerCase()}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`

const toQuery = (params: Record<string, string>) =>
  Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&")

/**
 * 구글·네이버: 웹 SignInForm 과 같은 implicit(response_type=token) 흐름 — 토큰이 리다이렉트 해시로 온다.
 * 카카오: 인가 코드(response_type=code)로 오고, 앱이 토큰으로 바꾼다(웹 auth/callback 과 같음).
 * 웹 중계 페이지가 해시/쿼리를 artinfo://auth/callback 쿼리로 넘겨준다.
 */
const buildAuthorizeUrl = (provider: Exclude<SnsProvider, "APPLE">, state: string) => {
  if (provider === "KAKAO") {
    return `https://kauth.kakao.com/oauth/authorize?${toQuery({
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: SNS_REDIRECT_URL,
      response_type: "code",
      prompt: "select_account",
      state,
    })}`
  }
  if (provider === "GOOGLE") {
    return `https://accounts.google.com/o/oauth2/v2/auth?${toQuery({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: SNS_REDIRECT_URL,
      response_type: "token",
      scope: "email profile",
      include_granted_scopes: "true",
      prompt: "select_account",
      state,
    })}`
  }
  return `https://nid.naver.com/oauth2.0/authorize?${toQuery({
    client_id: NAVER_CLIENT_ID,
    redirect_uri: SNS_REDIRECT_URL,
    response_type: "token",
    state,
  })}`
}

/** `artinfo://auth/callback?a=1&b=2` 또는 `...#a=1` 둘 다 받는다 */
const parseCallbackParams = (url: string) => {
  const params: Record<string, string> = {}
  const start = url.search(/[?#]/)
  if (start < 0) return params
  url
    .slice(start + 1)
    .split(/[&#]/)
    .forEach(pair => {
      const [key, value = ""] = pair.split("=")
      if (key) params[decodeURIComponent(key)] = decodeURIComponent(value.replace(/\+/g, " "))
    })
  return params
}

/** 카카오 인가 코드 → access token (REST API 키만 필요, 웹 auth/callback 과 같은 호출) */
const exchangeKakaoCode = async (code: string) => {
  const response = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: toQuery({
      grant_type: "authorization_code",
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: SNS_REDIRECT_URL,
      code,
    }),
  })
  const result = await response.json().catch(() => null)
  if (!result?.access_token) {
    throw new Error(result?.error_description || "카카오 토큰을 받지 못했습니다.")
  }
  return result.access_token as string
}

export type SnsSignInResult = "success" | "cancel"

/**
 * Apple 로그인 — 네이티브 시트로 identity token 을 받아 서버가 Apple 공개키로 검증한다.
 * 이름은 최초 로그인 1회만 내려오므로 그때 같이 보낸다 (서버는 가입 시에만 쓴다).
 */
const signInWithApple = async (): Promise<SnsSignInResult> => {
  let credential: AppleAuthentication.AppleAuthenticationCredential
  try {
    credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })
  } catch (error: any) {
    if (error?.code === "ERR_REQUEST_CANCELED") return "cancel"
    throw error
  }
  if (!credential.identityToken) {
    throw new Error("Apple 로그인 정보를 받지 못했습니다.")
  }
  const name = credential.fullName
    ? AppleAuthentication.formatFullName(credential.fullName).trim() || null
    : null
  await signInWithSns("APPLE", credential.identityToken, name)
  return "success"
}

/** 시스템 브라우저(ASWebAuthenticationSession / Custom Tabs)로 로그인하고 서버 토큰까지 받아 저장한다 */
export const signInWithSnsProvider = async (provider: SnsProvider): Promise<SnsSignInResult> => {
  if (provider === "APPLE") return signInWithApple()

  const state = randomState(provider)
  const result = await WebBrowser.openAuthSessionAsync(
    buildAuthorizeUrl(provider, state),
    APP_AUTH_CALLBACK_URL,
  )
  if (result.type !== "success") return "cancel"

  const params = parseCallbackParams(result.url)
  if (params.error) {
    throw new Error(params.error_description || `${SNS_LABEL[provider]} 로그인이 거부되었습니다.`)
  }
  if (params.state !== state) {
    throw new Error("로그인 응답이 올바르지 않습니다. 다시 시도해주세요.")
  }
  const accessToken =
    provider === "KAKAO" && params.code ? await exchangeKakaoCode(params.code) : params.access_token
  if (!accessToken) {
    throw new Error(`${SNS_LABEL[provider]} 토큰을 받지 못했습니다.`)
  }

  await signInWithSns(provider, accessToken)
  return "success"
}

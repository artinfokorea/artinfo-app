import { Redirect } from "expo-router"
import React from "react"

/**
 * OAuth 딥링크 종점(artinfo://auth/callback).
 * 정상 흐름에선 인증 세션(openAuthSessionAsync)이 URL 을 가로채므로 이 화면은 뜨지 않는다.
 * 세션 밖에서 열리면 홈으로 보내고, 로그인 벽이 알아서 로그인 화면으로 돌린다.
 */
export default function AuthCallbackScreen() {
  return <Redirect href="/" />
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api-artinfokorea.com"

export const WEB_BASE_URL = "https://artinfokorea.com"

/** 이용약관·개인정보처리방침 — 웹과 같은 문서를 앱에서 연다 */
export const TERMS_URL = `${WEB_BASE_URL}/terms`
export const PRIVACY_URL = `${WEB_BASE_URL}/privacy`

/** 간편로그인(OAuth) — 웹과 같은 클라이언트를 쓰고, 리다이렉트는 웹 중계 페이지(/auth/app-callback)를 거쳐 앱으로 돌아온다 */
export const GOOGLE_CLIENT_ID = "176284517106-onu8c6j45ftkfhh3od13gs5redcutgf2.apps.googleusercontent.com"
export const NAVER_CLIENT_ID = "J7dv_pn1eEZHKlugnsWW"
// 카카오 키는 퍼블릭 저장소라 소스에 두지 않는다 — 로컬은 .env.local, CI 는 GitHub Secrets(EXPO_PUBLIC_KAKAO_*) 에서 번들 시 주입
export const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY ?? ""
/** 카카오 지도 JavaScript 키 — 웹(NEXT_PUBLIC_KAKAO_API_KEY)과 같은 키. 도메인 제한이 있어 WebView 는 artinfokorea.com 을 baseUrl 로 띄운다 */
export const KAKAO_JAVASCRIPT_KEY = process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? ""
// artinfokorea.com → www 로 307 리다이렉트되지만 해시(#access_token)는 유지되므로 그대로 동작한다
export const SNS_REDIRECT_URL = `${WEB_BASE_URL}/auth/app-callback`
export const APP_AUTH_CALLBACK_URL = "artinfo://auth/callback"

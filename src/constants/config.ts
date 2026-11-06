export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://api-artinfokorea.com"

export const WEB_BASE_URL = "https://artinfokorea.com"

/** 이용약관·개인정보처리방침 — 웹과 같은 문서를 앱에서 연다 */
export const TERMS_URL = `${WEB_BASE_URL}/terms`
export const PRIVACY_URL = `${WEB_BASE_URL}/privacy`

/** 간편로그인(OAuth) — 웹과 같은 클라이언트를 쓰고, 리다이렉트는 웹 중계 페이지(/auth/app-callback)를 거쳐 앱으로 돌아온다 */
export const GOOGLE_CLIENT_ID = "176284517106-onu8c6j45ftkfhh3od13gs5redcutgf2.apps.googleusercontent.com"
export const NAVER_CLIENT_ID = "J7dv_pn1eEZHKlugnsWW"
export const KAKAO_REST_API_KEY = "abb02d5efc9563fab76fe2c4d9a6c82e"
// artinfokorea.com → www 로 307 리다이렉트되지만 해시(#access_token)는 유지되므로 그대로 동작한다
export const SNS_REDIRECT_URL = `${WEB_BASE_URL}/auth/app-callback`
export const APP_AUTH_CALLBACK_URL = "artinfo://auth/callback"

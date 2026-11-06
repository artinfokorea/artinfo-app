import { usePathname } from "expo-router"
import * as SecureStore from "expo-secure-store"
import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

import { API_BASE_URL } from "@/constants/config"
import { getValidAccessToken } from "@/lib/auth-store"

/**
 * 방문 하트비트 — 관리자 지표(DAU·WAU·MAU·리텐션·체류시간)의 원본. 웹 components/provider/ActivityTracker 의 앱판.
 * 기기마다 무작위 방문자 ID 하나를 SecureStore 에 두고, 앱이 화면에 떠 있는 동안의 시간만 세서
 * 1분마다, 그리고 백그라운드로 갈 때 서버로 보낸다. 로그인 상태면 토큰을 붙여 서버가 회원 ID 도 남긴다.
 * 웹과 달리 로봇·입력 여부는 따지지 않는다 (앱은 사람이 직접 연다). 개발 빌드에서는 보내지 않는다.
 */

const VISITOR_KEY = "artinfo_vid"
const LAST_PING_KEY = "artinfo_last_ping"
const PING_INTERVAL_MS = 60 * 1000
/** 30분 넘게 쉬었다 오면 새 방문으로 센다 */
const SESSION_GAP_MS = 30 * 60 * 1000
/** 참여 기준 (웹과 같음): 10초 이상 보였거나 2화면 이상 봤을 때부터 보낸다 */
const ENGAGED_VISIBLE_MS = 10 * 1000
const ENGAGED_PAGE_VIEWS = 2

const randomId = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16)
  })

const storage = {
  async get(key: string) {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  set(key: string, value: string) {
    SecureStore.setItemAsync(key, value).catch(() => {})
  },
}

export const ActivityTracker = () => {
  const pathname = usePathname()
  const onPageViewRef = useRef<((path: string) => void) | null>(null)
  const pendingPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (onPageViewRef.current) onPageViewRef.current(pathname)
    else pendingPathRef.current = pathname
  }, [pathname])

  useEffect(() => {
    // 시뮬레이터·개발 빌드에서 운영 지표가 오염되지 않게 한다 (웹은 실제 도메인에서만 보낸다)
    if (__DEV__) return

    let disposed = false
    let visitorId = ""
    let lastPing = 0
    let visibleSince: number | null = AppState.currentState === "active" ? Date.now() : null
    let pendingMs = 0
    let totalVisibleMs = 0
    let totalPageViews = 0
    let pendingPageViews = 0
    let pendingPaths: string[] = []
    let landingPath = pathname
    let currentPath = pathname
    let engaged = false

    const collect = () => {
      if (visibleSince !== null) {
        const now = Date.now()
        pendingMs += now - visibleSince
        totalVisibleMs += now - visibleSince
        visibleSince = now
      }
    }

    const send = async () => {
      if (!visitorId) return
      collect()
      if (!engaged) {
        engaged = totalVisibleMs >= ENGAGED_VISIBLE_MS || totalPageViews >= ENGAGED_PAGE_VIEWS
        if (!engaged) return
      }
      const newSession = !lastPing || Date.now() - lastPing > SESSION_GAP_MS
      const seconds = Math.round(pendingMs / 1000)
      const pageViews = pendingPageViews
      if (!newSession && seconds === 0 && pageViews === 0) return
      const paths = pendingPaths
      pendingMs = 0
      pendingPageViews = 0
      pendingPaths = []
      lastPing = Date.now()
      storage.set(LAST_PING_KEY, String(lastPing))

      const headers: Record<string, string> = { "Content-Type": "application/json" }
      const token = await getValidAccessToken().catch(() => null)
      if (token) headers.Authorization = `Bearer ${token}`

      // 지표 전송 실패는 사용자에게 영향이 없어야 한다 — 오류는 무시
      fetch(`${API_BASE_URL}/activity/ping`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          visitorId,
          seconds,
          pageViews,
          newSession,
          path: landingPath,
          currentPath,
          paths,
          referrer: "",
        }),
      }).catch(() => {})
    }

    const onAppState = (state: AppStateStatus) => {
      if (state === "active") {
        visibleSince = Date.now()
        void send()
      } else {
        collect()
        visibleSince = null
        void send()
      }
    }

    onPageViewRef.current = (path: string) => {
      currentPath = path
      totalPageViews += 1
      pendingPageViews += 1
      pendingPaths.push(path)
      if (!engaged && totalPageViews >= ENGAGED_PAGE_VIEWS) void send()
    }
    if (pendingPathRef.current !== null) {
      landingPath = pendingPathRef.current
      onPageViewRef.current(pendingPathRef.current)
      pendingPathRef.current = null
    }

    const subscription = AppState.addEventListener("change", onAppState)
    const firstTimer = setTimeout(() => {
      if (AppState.currentState === "active") void send()
    }, ENGAGED_VISIBLE_MS + 500)
    const timer = setInterval(() => {
      if (AppState.currentState === "active") void send()
    }, PING_INTERVAL_MS)

    void (async () => {
      const [storedId, storedPing] = await Promise.all([storage.get(VISITOR_KEY), storage.get(LAST_PING_KEY)])
      if (disposed) return
      visitorId = storedId ?? randomId()
      if (!storedId) storage.set(VISITOR_KEY, visitorId)
      lastPing = Number(storedPing ?? 0)
    })()

    return () => {
      disposed = true
      clearTimeout(firstTimer)
      clearInterval(timer)
      subscription.remove()
      onPageViewRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

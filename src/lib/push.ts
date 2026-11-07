import Constants from "expo-constants"
import * as Device from "expo-device"
import * as Notifications from "expo-notifications"
import { AndroidImportance } from "expo-notifications"
import { Platform } from "react-native"
import { useSyncExternalStore } from "react"

import { registerPushToken, unregisterPushToken } from "@/services/push"

/**
 * 푸시 토큰 상태 (온기와 같은 구성)
 * - registered: 토큰이 서버에 등록됨 (정상)
 * - denied: 기기 설정에서 알림이 꺼져 있음 → 설정 앱으로 안내
 * - unavailable: 시뮬레이터 등 토큰을 받을 수 없는 환경
 * - error: 등록 요청 실패 (네트워크 등)
 * - idle: 아직 시도 전
 */
export type PushStatus = "idle" | "registered" | "denied" | "unavailable" | "error"

let status: PushStatus = "idle"
/** 마지막으로 서버에 등록한 이 기기의 Expo Push Token — 로그아웃 시 해제용 */
let registeredToken: string | null = null
const listeners = new Set<() => void>()

const setStatus = (next: PushStatus) => {
  status = next
  listeners.forEach(listener => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** 현재 푸시 토큰 상태를 구독한다 (내 정보 화면의 안내 문구용) */
export const usePushStatus = () =>
  useSyncExternalStore(
    subscribe,
    () => status,
    () => status,
  )

const fetchExpoPushToken = async (): Promise<{
  token: string | null
  denied: boolean
}> => {
  if (!Device.isDevice) return { token: null, denied: false }
  // Android 13+ 는 알림 채널이 있어야 권한 팝업이 뜬다 — 서버가 channelId 없이 보내므로 Expo 기본값 'default' 와 맞춘다
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "기본 알림",
      importance: AndroidImportance.DEFAULT,
    })
  }
  const { status: existing } = await Notifications.getPermissionsAsync()
  const permission = existing === "granted" ? existing : (await Notifications.requestPermissionsAsync()).status
  if (permission !== "granted") return { token: null, denied: true }
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined
  const { data } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined)
  return { token: data, denied: false }
}

/**
 * 권한을 묻고(처음 한 번) 이 기기 토큰을 서버에 등록한다 — 로그인 직후, 앱 활성화 시, 알림 스위치를 켤 때 호출.
 * 반환값은 동기화 후 상태.
 */
export const syncPushToken = async (): Promise<PushStatus> => {
  try {
    const { token, denied } = await fetchExpoPushToken()
    if (denied) {
      setStatus("denied")
      return "denied"
    }
    if (!token) {
      setStatus("unavailable")
      return "unavailable"
    }
    if (token !== registeredToken) {
      await registerPushToken(token, Platform.OS === "android" ? "android" : "ios")
      registeredToken = token
    }
    setStatus("registered")
    return "registered"
  } catch {
    setStatus("error")
    return "error"
  }
}

/** 로그아웃 직전에 호출 — 이 기기 토큰만 서버에서 지운다 (실패해도 무시) */
export const unregisterCurrentPushToken = async (): Promise<void> => {
  const token = registeredToken
  registeredToken = null
  setStatus("idle")
  if (!token) return
  await unregisterPushToken(token).catch(() => {})
}

/** 알림창의 아트인포 알림을 모두 지우고 아이콘 배지를 0 으로 — 실패해도 조용히 (권한 없음·시뮬레이터) */
export const clearDeliveredNotifications = async (): Promise<void> => {
  try {
    await Notifications.dismissAllNotificationsAsync()
    await Notifications.setBadgeCountAsync(0)
  } catch {
    // 알림 권한이 없거나 지원하지 않는 환경
  }
}

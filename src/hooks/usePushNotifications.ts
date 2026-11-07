import { useQueryClient } from "@tanstack/react-query"
import * as Notifications from "expo-notifications"
import { router } from "expo-router"
import { useEffect } from "react"
import { AppState } from "react-native"

import { useAuth } from "@/lib/auth"
import { clearDeliveredNotifications, syncPushToken } from "@/lib/push"
import { queries } from "@/lib/queries"

// 앱이 켜져 있을 때도 배너로 보여준다
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

/**
 * 푸시 페이로드(data)로 이동할 화면 — 서버 ArtinfoPushService 가 넣는 { type, jobId? }
 * - jobs: 매일 12시 채용 요약 → 채용 탭
 * - job: 공고 하나 → 상세 (이전 형식, 호환용)
 */
const navigateForPushData = (data: Record<string, unknown> | undefined) => {
  if (data?.type === "jobs") {
    router.push("/(tabs)/jobs")
    return
  }
  if (data?.type === "job" && typeof data.jobId === "string" && data.jobId) {
    router.push(`/jobs/${data.jobId}`)
  }
}

/**
 * 로그인 상태가 되면 권한을 묻고 푸시 토큰을 서버에 등록한다.
 * 앱이 다시 활성화될 때도 동기화해, 기기 설정에서 알림을 켜고 돌아온 경우를 잡는다.
 * 알림을 탭하면 페이로드(jobId)로 채용 상세로 이동하고, 앱이 활성화되면 알림창·배지를 비운다.
 */
export const usePushNotifications = () => {
  const { isLoggedIn } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!isLoggedIn) return
    void syncPushToken()
    void clearDeliveredNotifications()
    const sub = AppState.addEventListener("change", state => {
      if (state === "active") {
        void syncPushToken()
        void clearDeliveredNotifications()
      }
    })
    return () => sub.remove()
  }, [isLoggedIn])

  useEffect(() => {
    const open = (data: Record<string, unknown> | undefined) => {
      // 푸시가 알린 새 공고가 목록에 바로 보이게
      void queryClient.invalidateQueries({ queryKey: queries.jobs._def })
      navigateForPushData(data)
    }
    // 종료 상태에서 알림으로 켜진 경우
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) open(response.notification.request.content.data as Record<string, unknown>)
    })
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      open(response.notification.request.content.data as Record<string, unknown>)
    })
    // 앱이 켜져 있는 동안 배너로 도착한 푸시 — 탭하지 않아도 채용 목록이 갱신되게
    const receivedSub = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: queries.jobs._def })
    })
    return () => {
      sub.remove()
      receivedSub.remove()
    }
  }, [queryClient])
}

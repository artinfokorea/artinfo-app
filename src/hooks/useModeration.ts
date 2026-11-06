import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { ActionSheetIOS, Alert } from "react-native"

import { useToast } from "@/components/ui/Toast"
import { useAuth, useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { blockUser, REPORT_REASONS, reportContent, ReportTargetType } from "@/services/moderation"

/** 내가 차단한 회원 ID 집합 — 글·댓글 목록에서 숨기는 데 쓴다 (비로그인은 빈 집합) */
export const useBlockedUserIds = () => {
  const { isLoggedIn } = useAuth()
  const { data } = useQuery({ ...queries.moderation.blockedUsers(), enabled: isLoggedIn, staleTime: 60_000 })
  return useMemo(() => new Set(data ?? []), [data])
}

/**
 * 신고·차단 동작 (App Store 1.2 UGC).
 * 신고: 사유를 고르면 서버에 접수되고 운영자가 검토한다. 차단: 확인 뒤 그 회원의 글·댓글이 내 화면에서 사라진다.
 */
export const useModeration = () => {
  const queryClient = useQueryClient()
  const requireAuth = useRequireAuth()
  const { successToast, errorToast } = useToast()

  const report = useCallback(
    (targetType: ReportTargetType, targetId: number) => {
      if (!requireAuth()) return
      const options = [...REPORT_REASONS.map(reason => reason.label), "취소"]
      ActionSheetIOS.showActionSheetWithOptions(
        { title: "신고 사유를 선택해주세요", options, cancelButtonIndex: options.length - 1 },
        async index => {
          const reason = REPORT_REASONS[index]
          if (!reason) return
          try {
            await reportContent({ targetType, targetId, reason: reason.code })
            successToast("신고가 접수되었습니다. 24시간 안에 검토합니다.")
          } catch (error: any) {
            errorToast(error?.message ?? "신고에 실패했습니다.")
          }
        },
      )
    },
    [requireAuth, successToast, errorToast],
  )

  const block = useCallback(
    (userId: number, nickname?: string) => {
      if (!requireAuth()) return
      Alert.alert(
        "사용자 차단",
        `${nickname ? `'${nickname}' 님을` : "이 사용자를"} 차단하면 이 사용자의 글과 댓글이 더 이상 보이지 않습니다.`,
        [
          { text: "취소", style: "cancel" },
          {
            text: "차단",
            style: "destructive",
            onPress: async () => {
              try {
                await blockUser(userId)
                await queryClient.invalidateQueries({ queryKey: queries.moderation._def })
                successToast("차단했습니다. 이 사용자의 글과 댓글이 숨겨집니다.")
              } catch (error: any) {
                errorToast(error?.message ?? "차단에 실패했습니다.")
              }
            },
          },
        ],
      )
    },
    [requireAuth, queryClient, successToast, errorToast],
  )

  return { report, block }
}

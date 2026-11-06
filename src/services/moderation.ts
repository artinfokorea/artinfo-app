import { authApiRequest } from "."
import { DetailApiResponse, SuccessResponse } from "@/interface"

export type ReportTargetType = "POST" | "COMMENT" | "USER"

export type ReportPayload = {
  targetType: ReportTargetType
  targetId: number
  reason: string
}

/** 신고 사유 — 서버는 코드만 저장하고 운영자가 검토한다 */
export const REPORT_REASONS: { code: string; label: string }[] = [
  { code: "SPAM", label: "스팸·광고" },
  { code: "ABUSE", label: "욕설·비방·혐오" },
  { code: "SEXUAL", label: "음란·선정성" },
  { code: "FRAUD", label: "사기·허위 정보" },
  { code: "PRIVACY", label: "개인정보 노출" },
  { code: "OTHER", label: "기타" },
]

/** 글·댓글·회원 신고 (App Store 1.2 UGC) */
export const reportContent = (payload: ReportPayload): Promise<SuccessResponse> =>
  authApiRequest.post<SuccessResponse>("/moderation/reports", payload)

export const blockUser = (userId: number): Promise<SuccessResponse> =>
  authApiRequest.post<SuccessResponse>("/moderation/blocks", { userId })

export const unblockUser = (userId: number): Promise<SuccessResponse> =>
  authApiRequest.delete<SuccessResponse>(`/moderation/blocks/${userId}`)

export const getBlockedUserIds = async (): Promise<number[]> => {
  const response = await authApiRequest.get<DetailApiResponse<{ userIds: number[] }>>("/moderation/blocks")
  return response.item?.userIds ?? []
}

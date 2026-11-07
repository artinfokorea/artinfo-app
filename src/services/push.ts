import { authApiRequest } from "."
import { DetailApiResponse, SuccessResponse } from "@/interface"

/** 종류별 푸시 수신 설정 — 서버에 저장돼 모든 기기에 공통 */
export type PushPreferences = {
  /** 새 채용 공고 */
  job: boolean
}

/** 이 기기의 Expo Push Token 을 서버에 등록 (로그인 후) */
export const registerPushToken = (token: string, platform: "ios" | "android") =>
  authApiRequest.post<SuccessResponse>("/push/tokens", { token, platform })

/** 로그아웃 시 이 기기 토큰만 해제 */
export const unregisterPushToken = (token: string) => authApiRequest.delete<SuccessResponse>("/push/tokens", { token })

export const getPushPreferences = async (): Promise<PushPreferences> => {
  const response = await authApiRequest.get<DetailApiResponse<PushPreferences>>("/push/preferences")
  return response.item
}

/** 바꿀 항목만 보내면 된다 — 서버가 나머지는 유지하고 전체를 돌려준다 */
export const updatePushPreferences = async (patch: Partial<PushPreferences>): Promise<PushPreferences> => {
  const response = await authApiRequest.put<DetailApiResponse<PushPreferences>>("/push/preferences", patch)
  return response.item
}

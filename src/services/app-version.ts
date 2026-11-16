import { publicApiRequest } from "."
import { DetailApiResponse } from "@/interface"

export type AppVersionCheck = {
  platform: "ios" | "android"
  /** 이보다 낮으면 강제 업데이트 */
  minVersion: string
  latestVersion: string | null
  storeUrl: string
  /** 관리자가 적은 안내 문구 (없으면 null) */
  message: string | null
  /** 서버가 보낸 version 으로 판정한 값 */
  updateRequired: boolean | null
  updateAvailable: boolean | null
}

/** 앱 기동 시 최소 버전 확인 — 서버가 현재 버전과 비교해 판정해 준다 */
export const checkAppVersion = async (platform: "ios" | "android", version: string): Promise<AppVersionCheck> => {
  const response = await publicApiRequest.get<DetailApiResponse<AppVersionCheck>>("/app/version", {
    params: { platform, version },
  })
  return response.item
}

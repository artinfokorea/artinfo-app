import { COMPETITION } from "@/types/competitions"
import { publicApiRequest, authApiRequest, QueryParams } from "."
import { exceptionHandler } from "@/lib/exception-handler"
import { DetailApiResponse, ListApiResponse, ListResponse, ScrollApiResponse, SuccessResponse } from "@/interface"
import { CompetitionPayload, CompetitionsRequest } from "@/interface/competitions"

const toParams = (request: CompetitionsRequest) => {
  const params = new QueryParams()
  for (const [key, value] of Object.entries(request)) {
    if (Array.isArray(value)) value.forEach(v => params.append(key, v.toString()))
    else if (value) params.append(key, value.toString())
  }
  return params
}

/* 콩쿠르 목록 (마감임박순, phases 비우면 종료 제외) */
export const getCompetitions = async (request: CompetitionsRequest): Promise<ListResponse<COMPETITION, "competitions">> => {
  try {
    const response = await publicApiRequest.get<ListApiResponse<COMPETITION, "competitions">>("/competitions", {
      params: toParams(request),
    })
    return response.item
  } catch (error) {
    throw new Error(exceptionHandler(error, "API getCompetitions error"))
  }
}

export const getInfiniteCompetitions = async (
  request: CompetitionsRequest,
): Promise<ScrollApiResponse<COMPETITION, "competitions">> => {
  const response = await getCompetitions(request)
  return {
    competitions: response.competitions,
    nextPage: request.page ? request.page + 1 : 2,
    isLast: response.competitions.length < request.size,
    totalCount: response.totalCount ?? 0,
  }
}

/** 상세 — 토큰을 같이 보내 '검토 중'인 내 공고도 볼 수 있게 한다 (비로그인이면 토큰 없이) */
export const getCompetition = async (id: number): Promise<COMPETITION> => {
  try {
    const response = await authApiRequest.get<DetailApiResponse<COMPETITION>>(`/competitions/${id}`)
    return response.item
  } catch (error) {
    throw new Error(exceptionHandler(error, "API getCompetition error"))
  }
}

export const createCompetition = async (
  payload: CompetitionPayload,
): Promise<{ id: number; status: "REVIEW" | "PUBLISHED" }> => {
  try {
    const response = await authApiRequest.post<DetailApiResponse<{ id: number; status: "REVIEW" | "PUBLISHED" }>>(
      "/competitions",
      payload,
    )
    return response.item
  } catch (error) {
    throw new Error(exceptionHandler(error, "API createCompetition error"))
  }
}

export const updateCompetition = async (id: number, payload: CompetitionPayload): Promise<SuccessResponse> => {
  try {
    return await authApiRequest.put<SuccessResponse>(`/competitions/${id}`, payload)
  } catch (error) {
    throw new Error(exceptionHandler(error, "API updateCompetition error"))
  }
}

export const deleteCompetition = async (id: number): Promise<SuccessResponse> => {
  try {
    return await authApiRequest.delete<SuccessResponse>(`/competitions/${id}`)
  } catch (error) {
    throw new Error(exceptionHandler(error, "API deleteCompetition error"))
  }
}

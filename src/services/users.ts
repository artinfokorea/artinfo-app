import { USER } from "@/types/users"
import { authApiRequest, publicApiRequest } from "."
import { exceptionHandler } from "@/lib/exception-handler"
import { DetailApiResponse, SuccessResponse } from "@/interface"
import { UserPayload } from "@/interface/users"

export const getMe = async (): Promise<USER> => {
  try {
    const response =
      await authApiRequest.get<DetailApiResponse<USER>>("/users/me")
    return response.item
  } catch (error) {
    throw new Error(exceptionHandler(error, "API getMe error"))
  }
}

export const updateUser = async (
  payload: UserPayload,
): Promise<SuccessResponse> => {
  const response = await authApiRequest.put<SuccessResponse>(
    "/users/me",
    payload,
  )
  return response
}

export const updateUserPhone = async (
  phone: string,
): Promise<SuccessResponse> => {
  const response = await authApiRequest.put<SuccessResponse>(
    "/users/me/phone",
    {
      phone,
    },
  )
  return response
}

export const updateUserPassword = async (
  password: string,
  email: string,
): Promise<SuccessResponse> => {
  const response = await publicApiRequest.put<SuccessResponse>(
    "/users/me/password",
    {
      password,
      email,
    },
  )
  return response
}

/** 회원탈퇴 — 서버가 개인정보를 익명화하고 탈퇴 처리한다 (앱 심사 지침 5.1.1(v)) */
export const withdrawUser = async (): Promise<SuccessResponse> => {
  return authApiRequest.delete<SuccessResponse>("/users/me")
}

import { ListApiResponse, ListResponse, SuccessResponse } from "@/interface"
import { publicApiRequest, authApiRequest } from "."
import { exceptionHandler } from "@/lib/exception-handler"
import { IMAGE, PROVINCE, UploadTarget } from "@/types"
import { VerifyPhoneCodePayload } from "@/interface/systems"

/** expo-image-picker 결과 등 React Native 파일 객체 */
export type UploadFile = { uri: string; name?: string; type?: string }

export const getProvinces = async (
  depth?: number,
): Promise<ListResponse<PROVINCE, "provinces">> => {
  try {
    const response = await publicApiRequest.get<
      ListApiResponse<PROVINCE, "provinces">
    >("/provinces", {
      params: {
        parentId: depth,
      },
    })
    return response.item
  } catch (error) {
    throw new Error(exceptionHandler(error, "API getProvince error"))
  }
}

export const sendPhoneVerificationCode = async (
  phone: string,
): Promise<SuccessResponse> => {
  const response = await authApiRequest.post<SuccessResponse>(
    "/verifications/mobile",
    { phone },
  )
  return response
}

export const verifyPhoneCode = async (
  payload: VerifyPhoneCodePayload,
): Promise<SuccessResponse> => {
  const response = await authApiRequest.put<SuccessResponse>(
    "/verifications/mobile",
    payload,
  )
  return response
}

export const uploadImages = async (
  target: UploadTarget,
  imageFiles: UploadFile[],
): Promise<ListResponse<IMAGE, "images">> => {
  const formData = new FormData()
  imageFiles.forEach(file =>
    formData.append("imageFiles", {
      uri: file.uri,
      name: file.name ?? `image_${Date.now()}.jpg`,
      type: file.type ?? "image/jpeg",
    } as any),
  )
  formData.append("target", target)
  // formData.append("compress", `${compress}`)

  const response = await authApiRequest.post<ListApiResponse<IMAGE, "images">>(
    "/system/upload/images",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  )

  return response.item
}

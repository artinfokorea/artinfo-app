import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { router } from "expo-router"

import { API_BASE_URL } from "@/constants/config"
import { getValidAccessToken, signOut } from "@/lib/auth-store"

/** React Native 의 URLSearchParams 는 일부 메서드가 없어서 직접 구현한다. */
export class QueryParams {
  private parts: [string, string][] = []
  append(key: string, value: string) {
    this.parts.push([key, value])
  }
  toString() {
    return this.parts
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&")
  }
}

const paramsSerializer = {
  serialize: (params: any) =>
    params instanceof QueryParams ? params.toString() : toSearchParams(params),
}

export const publicInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  paramsSerializer,
})

publicInstance.interceptors.response.use(({ data }) => data)

export const authInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  paramsSerializer,
})

authInstance.interceptors.request.use(async config => {
  const accessToken = await getValidAccessToken()
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`
  }
  return config
})

authInstance.interceptors.response.use(
  ({ data }) => data,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await signOut()
      router.push("/auth/sign-in")
    }
    return Promise.reject(error)
  },
)

interface ApiRequestMethods {
  get<T>(url: string, request?: AxiosRequestConfig): Promise<T>
  post<T>(url: string, body?: any, config?: AxiosRequestConfig): Promise<T>
  put<T>(url: string, body?: any): Promise<T>
  patch<T>(url: string, body?: any): Promise<T>
  delete<T>(url: string): Promise<T>
}

const wrap = (instance: typeof publicInstance): ApiRequestMethods => ({
  // 응답 인터셉터가 response.data 를 돌려주므로 결과는 곧 API body 다.
  get: (url, request) => instance.get(url, request) as Promise<any>,
  post: (url, body, config) =>
    instance.post(url, body, config ?? {}) as Promise<any>,
  put: (url, body) => instance.put(url, body) as Promise<any>,
  patch: (url, body) => instance.patch(url, body) as Promise<any>,
  delete: url => instance.delete(url) as Promise<any>,
})

export const authApiRequest = wrap(authInstance)
export const publicApiRequest = wrap(publicInstance)

/** 배열 값은 key=a&key=b 형태로 직렬화한다 (웹의 URLSearchParams 처리와 동일). */
export const toSearchParams = (request: object) => {
  const parts: string[] = []
  for (const [key, value] of Object.entries(request)) {
    if (Array.isArray(value)) {
      value.forEach(v =>
        parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`),
      )
    } else if (value !== undefined && value !== null && value !== "") {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
      )
    }
  }
  return parts.join("&")
}

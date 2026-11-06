import * as SecureStore from "expo-secure-store"

import { API_BASE_URL } from "@/constants/config"

export type AuthTokens = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresIn: string
  refreshTokenExpiresIn: string
}

const STORAGE_KEY = "artinfo.auth.tokens"

type Listener = (tokens: AuthTokens | null) => void

let current: AuthTokens | null = null
let loaded = false
const listeners = new Set<Listener>()

const notify = () => listeners.forEach(listener => listener(current))

export const authStore = {
  async load() {
    if (loaded) return current
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEY)
      current = raw ? (JSON.parse(raw) as AuthTokens) : null
    } catch {
      current = null
    }
    loaded = true
    notify()
    return current
  },

  get() {
    return current
  },

  async set(tokens: AuthTokens | null) {
    current = tokens
    if (tokens) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(tokens))
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY)
    }
    notify()
  },

  subscribe(listener: Listener) {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}

const toTokens = (item: any): AuthTokens => ({
  accessToken: item.accessToken,
  refreshToken: item.refreshToken,
  accessTokenExpiresIn: String(item.accessTokenExpiresIn),
  refreshTokenExpiresIn: String(item.refreshTokenExpiresIn),
})

const postJson = async (path: string, body: unknown) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const result = await response.json().catch(() => null)
  return { ok: response.ok, result }
}

/** 이메일 로그인 — 웹의 NextAuth "signin-email" provider 와 같은 API */
export const signInWithEmail = async (email: string, password: string) => {
  const { result } = await postJson("/auths/login/email", { email, password })
  if (!result?.item) {
    throw new Error(result?.message ?? "이메일 또는 비밀번호를 확인해주세요.")
  }
  await authStore.set(toTokens(result.item))
}

/** SNS 로그인 — 웹의 NextAuth "sns" provider 와 같은 API. name 은 Apple 최초 로그인 때만 온다 */
export const signInWithSns = async (type: string, accessToken: string, name?: string | null) => {
  const { result } = await postJson("/auths/login/sns", {
    type,
    token: accessToken,
    ...(name ? { name } : {}),
  })
  if (!result?.item) {
    throw new Error(result?.message ?? "SNS 로그인에 실패했습니다.")
  }
  await authStore.set(toTokens(result.item))
}

export const signOut = () => authStore.set(null)

let refreshing: Promise<AuthTokens | null> | null = null

/** 만료된 access token 을 갱신해서 돌려준다. 실패하면 로그아웃 상태로 만든다. */
export const getValidAccessToken = async (): Promise<string | null> => {
  const tokens = current ?? (await authStore.load())
  if (!tokens) return null

  if (new Date() < new Date(tokens.accessTokenExpiresIn)) {
    return tokens.accessToken
  }

  if (!refreshing) {
    refreshing = (async () => {
      try {
        const { result } = await postJson("/auths/refresh", {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        })
        if (result?.item) {
          const next = toTokens(result.item)
          await authStore.set(next)
          return next
        }
      } catch {
        // fall through
      }
      await authStore.set(null)
      return null
    })().finally(() => {
      refreshing = null
    })
  }

  const next = await refreshing
  return next?.accessToken ?? null
}

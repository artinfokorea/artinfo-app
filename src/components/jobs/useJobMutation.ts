import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { useToast } from "@/components/ui/Toast"
import { queries } from "@/lib/queries"

/** 서버 에러 메시지를 꺼낸다 (axios 에러면 response.data.message 우선) */
export const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.message || fallback

/**
 * 웹 hooks/useMutation 과 같은 역할: 실행 → 토스트 → jobs 쿼리 무효화.
 * 성공하면 결과를, 실패하면 undefined 를 돌려준다.
 */
export const useJobMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const run = async <R>(fn: () => Promise<R>, successMessage: string, failMessage = "요청에 실패했습니다.") => {
    try {
      setIsLoading(true)
      const result = await fn()
      successToast(successMessage)
      await queryClient.invalidateQueries({ queryKey: [...queries.jobs._def] })
      return result
    } catch (error) {
      errorToast(errorMessage(error, failMessage))
      return undefined
    } finally {
      setIsLoading(false)
    }
  }

  return { run, isLoading }
}

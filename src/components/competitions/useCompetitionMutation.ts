import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { errorMessage } from "@/components/jobs/useJobMutation"
import { useToast } from "@/components/ui/Toast"
import { queries } from "@/lib/queries"

/** useJobMutation 과 같은 역할 — 실행 → 토스트 → competitions 쿼리 무효화 */
export const useCompetitionMutation = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const run = async <R>(fn: () => Promise<R>, successMessage: string, failMessage = "요청에 실패했습니다.") => {
    try {
      setIsLoading(true)
      const result = await fn()
      successToast(successMessage)
      await queryClient.invalidateQueries({ queryKey: [...queries.competitions._def] })
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

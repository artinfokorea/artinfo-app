import { router, Stack } from "expo-router"
import React, { useEffect, useRef, useState } from "react"

import { getErrorMessage } from "@/components/auth/ControlledField"
import { FormScreen } from "@/components/auth/FormScreen"
import { InquiryForm, InquiryFormData } from "@/components/inquiry/InquiryForm"
import { useToast } from "@/components/ui/Toast"
import { createInquiry } from "@/services/inquries"

/** 웹 app/(site)/inquiry */
export default function InquiryScreen() {
  const [isLoading, setIsLoading] = useState(false)
  // 스팸 방지 — 폼을 연 시각을 같이 보낸다 (서버가 3초 안 제출을 봇으로 본다)
  const startedAt = useRef(0)
  useEffect(() => {
    startedAt.current = Date.now()
  }, [])
  const { successToast, errorToast } = useToast()

  const handleInquiry = async (payload: InquiryFormData) => {
    try {
      setIsLoading(true)
      await createInquiry({ ...payload, startedAt: startedAt.current })
      successToast("문의가 성공적으로 등록되었습니다.")
      router.navigate("/")
    } catch (error: any) {
      errorToast(getErrorMessage(error, "문의 등록에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormScreen>
      <Stack.Screen options={{ title: "문의" }} />
      <InquiryForm handleInquiry={handleInquiry} isLoading={isLoading} />
    </FormScreen>
  )
}

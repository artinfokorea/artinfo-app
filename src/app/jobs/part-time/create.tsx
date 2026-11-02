import { useQuery } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useEffect } from "react"
import { Alert } from "react-native"

import { PartTimeForm, PartTimeFormData, toApiSchedules } from "@/components/jobs/PartTimeForm"
import { RequireLogin } from "@/components/jobs/RequireLogin"
import { useJobMutation } from "@/components/jobs/useJobMutation"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { createPartTimeJob, updatePartTimeJob } from "@/services/jobs"

/**
 * 웹 app/(site)/jobs/part-time/create (등록) + part-time/[id]?type=edit (수정).
 * 앱에서는 수정도 이 화면에서 처리한다: /jobs/part-time/create?id=123
 */
export default function PartTimeCreateScreen() {
  const params = useLocalSearchParams<{ id?: string }>()
  const jobId = params.id ? Number(params.id) : undefined

  return (
    <>
      <Stack.Screen options={{ title: jobId ? "구인 수정" : "구인 등록" }} />
      <RequireLogin>{jobId ? <EditPartTime jobId={jobId} /> : <CreatePartTime />}</RequireLogin>
    </>
  )
}

const toPayload = (data: PartTimeFormData) => ({
  title: data.title,
  companyName: data.companyName,
  fee: Number(data.fee),
  address: data.address,
  addressDetail: data.addressDetail,
  contents: data.contents,
  majorIds: data.majors.map(major => major.id),
  schedules: toApiSchedules(data.schedules),
})

const CreatePartTime = () => {
  const { user } = useAuth()
  const { run, isLoading } = useJobMutation()

  // 웹: 휴대폰 번호가 없으면 내 프로필에서 등록하도록 안내한다
  useEffect(() => {
    if (user && !user.phone) {
      Alert.alert("연주 등록은 휴대폰 번호를 통해 인증이 필요합니다.", "내 프로필에서 휴대폰 번호를 등록해주세요.", [
        { text: "내 프로필로 가기", onPress: () => router.replace("/my-profile") },
      ])
    }
  }, [user])

  const onSubmit = async (data: PartTimeFormData) => {
    const result = await run(() => createPartTimeJob(toPayload(data)), "단기 채용 공고가 등록되었습니다.")
    // 응답 body 는 { code, item: { id } } (웹도 newPartTimeJob.item.id 로 이동)
    const newId = (result as any)?.item?.id
    if (newId) router.replace(`/jobs/part-time/${newId}`)
    else if (result) router.back()
  }

  return <PartTimeForm onSubmit={onSubmit} isLoading={isLoading} />
}

const EditPartTime = ({ jobId }: { jobId: number }) => {
  const { run, isLoading } = useJobMutation()
  const { data: job, isLoading: isJobLoading } = useQuery(queries.jobs.detail(jobId))

  if (isJobLoading) return <Loading style={{ flex: 1 }} />
  if (!job) return <EmptyDataMessage message="채용 공고를 찾을 수 없습니다." />

  const onSubmit = async (data: PartTimeFormData) => {
    const result = await run(
      () => updatePartTimeJob(jobId, { ...toPayload(data), isActive: true }),
      "채용이 수정되었습니다.",
    )
    if (result) router.back()
  }

  return <PartTimeForm onSubmit={onSubmit} isLoading={isLoading} partTime={job} />
}

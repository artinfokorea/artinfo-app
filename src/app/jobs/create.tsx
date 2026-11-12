import { useQuery } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React from "react"

import { FullTimeJobForm, FullTimeJobFormData } from "@/components/jobs/FullTimeJobForm"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { RequireLogin } from "@/components/jobs/RequireLogin"
import { useJobMutation } from "@/components/jobs/useJobMutation"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { queries } from "@/lib/queries"
import { createFullTimeJob, updateArtOrganization } from "@/services/jobs"
import { JobType } from "@/types/jobs"

/**
 * 웹 app/(site)/jobs/create (등록) + jobs/[id]?type=edit (수정).
 * 앱에서는 수정도 이 화면에서 처리한다: /jobs/create?id=123&jobType=ART_ORGANIZATION
 */
export default function JobCreateScreen() {
  // 로그인이 필요한 화면 (웹 middleware 의 /*/create 와 같음)
  useSignInRedirect()
  const params = useLocalSearchParams<{ id?: string; jobType?: JobType }>()
  const jobId = params.id ? Number(params.id) : undefined
  const isEdit = !!jobId

  return (
    <>
      <Stack.Screen options={{ title: isEdit ? "채용 수정" : "채용 등록" }} />
      <RequireLogin>
        {isEdit ? <EditJob jobId={jobId} jobType={params.jobType} /> : <CreateJob jobType={params.jobType} />}
      </RequireLogin>
    </>
  )
}

const toPayload = (data: FullTimeJobFormData, type: JobType) => ({
  title: data.title,
  companyName: data.companyName,
  address: data.address,
  addressDetail: data.addressDetail,
  imageUrl: data.imageUrl || "",
  majorIds: data.majors.map(major => major.id),
  contents: data.contents,
  type,
  recruitSiteUrl: data.recruitSiteUrl || "",
})

const CreateJob = ({ jobType }: { jobType?: JobType }) => {
  const { run, isLoading } = useJobMutation()
  // 분류 선택은 폼 안의 세그먼트 — 링크로 넘어온 jobType 은 처음 값으로만 쓴다
  const initialType = jobType && Object.values(JobType).includes(jobType) ? jobType : undefined

  const onSubmit = async (data: FullTimeJobFormData, type: JobType) => {
    const result = await run(() => createFullTimeJob(toPayload(data, type)), "채용이 등록되었습니다.")
    if (result) router.back()
  }

  return <FullTimeJobForm onSubmit={onSubmit} isLoading={isLoading} initialType={initialType} />
}

const EditJob = ({ jobId, jobType }: { jobId: number; jobType?: JobType }) => {
  const { run, isLoading } = useJobMutation()
  const { data: job, isLoading: isJobLoading } = useQuery(queries.jobs.detail(jobId))

  if (isJobLoading) return <Loading style={{ flex: 1 }} />
  if (!job) return <EmptyDataMessage message="채용 공고를 찾을 수 없습니다." />

  const onSubmit = async (data: FullTimeJobFormData, type: JobType) => {
    const result = await run(() => updateArtOrganization(jobId, toPayload(data, type)), "채용이 수정되었습니다.")
    if (result) router.back()
  }

  return <FullTimeJobForm onSubmit={onSubmit} isLoading={isLoading} job={job} />
}


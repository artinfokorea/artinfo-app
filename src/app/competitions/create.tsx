import { useQuery } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React from "react"

import { CompetitionForm, CompetitionFormData } from "@/components/competitions/CompetitionForm"
import { useCompetitionMutation } from "@/components/competitions/useCompetitionMutation"
import { RequireLogin } from "@/components/jobs/RequireLogin"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { CompetitionPayload } from "@/interface/competitions"
import { queries } from "@/lib/queries"
import { createCompetition, updateCompetition } from "@/services/competitions"

/** 웹 app/(site)/competitions/create (등록) + [id]?type=edit (수정: /competitions/create?id=123) */
export default function CompetitionCreateScreen() {
  useSignInRedirect()
  const params = useLocalSearchParams<{ id?: string }>()
  const competitionId = params.id ? Number(params.id) : undefined

  return (
    <>
      <Stack.Screen options={{ title: competitionId ? "콩쿠르 수정" : "콩쿠르 등록" }} />
      <RequireLogin>{competitionId ? <EditCompetition id={competitionId} /> : <CreateCompetition />}</RequireLogin>
    </>
  )
}

export const toPayload = (d: CompetitionFormData): CompetitionPayload => ({
  title: d.title,
  host: d.host,
  organizer: d.organizer || undefined,
  area: d.area,
  venue: d.venue || undefined,
  divisions: d.divisions,
  ages: d.ages ?? [],
  openAt: d.openAt,
  closeAt: d.closeAt,
  heldAt: d.heldAt || undefined,
  resultAt: d.resultAt || undefined,
  fee: d.fee || undefined,
  applyMethod: d.applyMethod,
  applyLink: d.applyMethod === "LINK" ? d.applyLink || undefined : undefined,
  tel: d.tel || undefined,
  email: d.email || undefined,
  prize: d.prize || undefined,
  description: d.description || undefined,
  posterUrl: d.posterUrl || undefined,
  contentImages: d.contentImages ?? [],
})

const CreateCompetition = () => {
  const { run, isLoading } = useCompetitionMutation()
  const onSubmit = async (data: CompetitionFormData) => {
    const result = await run(
      () => createCompetition(toPayload(data)),
      "콩쿠르 등록을 요청했습니다. 확인 후 게시되며 그 전까지는 나에게만 보여요.",
    )
    if (result) router.replace(`/competitions/${result.id}`)
  }
  return <CompetitionForm onSubmit={onSubmit} isLoading={isLoading} />
}

const EditCompetition = ({ id }: { id: number }) => {
  const { run, isLoading } = useCompetitionMutation()
  const { data, isLoading: isDetailLoading } = useQuery(queries.competitions.detail(id))
  if (isDetailLoading) return <Loading style={{ flex: 1 }} />
  if (!data) return <EmptyDataMessage message="공고를 찾을 수 없습니다." />
  const onSubmit = async (form: CompetitionFormData) => {
    const result = await run(() => updateCompetition(id, toPayload(form)), "공고를 수정했습니다.")
    if (result) router.back()
  }
  return <CompetitionForm competition={data} onSubmit={onSubmit} isLoading={isLoading} />
}

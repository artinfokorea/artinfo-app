import { useQuery } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FullTimeJobForm, FullTimeJobFormData } from "@/components/jobs/FullTimeJobForm"
import { RequireLogin } from "@/components/jobs/RequireLogin"
import { useJobMutation } from "@/components/jobs/useJobMutation"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { createFullTimeJob, updateArtOrganization } from "@/services/jobs"
import { JobType, JobTypeList } from "@/types/jobs"

/**
 * 웹 app/(site)/jobs/create (등록) + jobs/[id]?type=edit (수정).
 * 앱에서는 수정도 이 화면에서 처리한다: /jobs/create?id=123&jobType=ART_ORGANIZATION
 */
export default function JobCreateScreen() {
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

  // 웹 FormTypeSelectDialog: 채용 종류를 먼저 고른다
  if (!jobType) {
    return (
      <View style={styles.selectContainer}>
        <View style={styles.selectCard}>
          <Text style={styles.selectTitle}>채용 선택</Text>
          <View style={styles.selectDivider} />
          <View style={styles.selectRow}>
            {JobTypeList.map(type => (
              <Pressable
                key={type.value}
                style={styles.selectButton}
                onPress={() => router.setParams({ jobType: type.value })}
              >
                <Text style={styles.selectButtonText}>{type.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    )
  }

  const onSubmit = async (data: FullTimeJobFormData) => {
    const result = await run(() => createFullTimeJob(toPayload(data, jobType)), "채용이 등록되었습니다.")
    if (result) router.back()
  }

  return <FullTimeJobForm onSubmit={onSubmit} isLoading={isLoading} withImage={jobType !== JobType.RELIGION} />
}

const EditJob = ({ jobId, jobType }: { jobId: number; jobType?: JobType }) => {
  const { run, isLoading } = useJobMutation()
  const { data: job, isLoading: isJobLoading } = useQuery(queries.jobs.detail(jobId))

  if (isJobLoading) return <Loading style={{ flex: 1 }} />
  if (!job) return <EmptyDataMessage message="채용 공고를 찾을 수 없습니다." />

  const type = jobType ?? job.type

  const onSubmit = async (data: FullTimeJobFormData) => {
    const result = await run(() => updateArtOrganization(jobId, toPayload(data, type)), "채용이 수정되었습니다.")
    if (result) router.back()
  }

  return (
    <FullTimeJobForm onSubmit={onSubmit} isLoading={isLoading} job={job} withImage={type !== JobType.RELIGION} />
  )
}

const styles = StyleSheet.create({
  selectContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  selectCard: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  selectTitle: { textAlign: "center", fontSize: 15, fontWeight: "700", paddingVertical: 18, color: colors.black },
  selectDivider: { height: 3, backgroundColor: colors.whitesmoke },
  selectRow: { flexDirection: "row", justifyContent: "center", gap: 8, paddingVertical: 48, paddingHorizontal: 16 },
  selectButton: {
    height: 40,
    minWidth: 84,
    paddingHorizontal: 12,
    borderRadius: 24,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
  selectButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
})

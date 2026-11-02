import { useQuery } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import React from "react"
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"

import { MajorBadges } from "@/components/jobs/JobCard"
import { ItemManageBox } from "@/components/jobs/ItemManageBox"
import { ShareButton } from "@/components/jobs/ShareButton"
import { useJobMutation } from "@/components/jobs/useJobMutation"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { HtmlContent } from "@/components/ui/HtmlContent"
import { Button, EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { deleteJob } from "@/services/jobs"
import { JobType } from "@/types/jobs"

const filter = filters()

/** 웹 app/(site)/jobs/[id] → JobDetailClient / JobDetailContainer */
export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const jobId = Number(id)
  const { isLoggedIn, user } = useAuth()
  const { run } = useJobMutation()

  const { data: job, isLoading, isError, refetch, isRefetching } = useQuery(queries.jobs.detail(jobId))

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "채용" }} />
        <Loading style={{ flex: 1 }} />
      </>
    )
  }
  if (isError || !job) {
    return (
      <>
        <Stack.Screen options={{ title: "채용" }} />
        <EmptyDataMessage message="채용 공고를 찾을 수 없습니다." />
      </>
    )
  }

  // 웹: 아마추어/소년소녀 공고가 아니면 비로그인 사용자에게 로그인 창을 띄운다
  const needsLogin = !isLoggedIn && job.type !== JobType.AMATEUR && job.type !== JobType.YOUTH
  const isAuthor = !!user && user.id === job.authorId

  const handleDelete = async () => {
    const result = await run(() => deleteJob(job.id), "채용이 삭제되었습니다.")
    if (result) router.back()
  }

  const openRecruitSite = () => job.recruitSiteUrl && WebBrowser.openBrowserAsync(job.recruitSiteUrl)

  return (
    <>
      <Stack.Screen
        options={{
          title: "채용",
          headerRight: () => <ShareButton path={`/jobs/${job.id}`} title={job.title} />,
        }}
      />
      <ScrollView
        contentContainerStyle={styles.container}
        scrollEnabled={!needsLogin}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      >
        {job.imageUrl ? (
          <FallbackImage src={job.imageUrl} fallbackText={job.companyName} style={styles.image} />
        ) : null}

        <View style={styles.info}>
          <Text style={styles.title}>{job.title}</Text>
          {job.majors?.majors?.length ? (
            <View style={styles.badges}>
              <MajorBadges majors={job.majors.majors} max={2} />
            </View>
          ) : null}
          <Text style={styles.address}>
            {job.address} {job.addressDetail}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{job.companyName}</Text>
            <Text style={styles.meta}>{filter.YYYYMMDD(job.createdAt)}</Text>
          </View>
          {job.recruitSiteUrl ? (
            <Pressable onPress={openRecruitSite} hitSlop={6}>
              <Text style={styles.link}>채용 사이트 바로가기</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          {isAuthor ? (
            <ItemManageBox
              onEdit={() =>
                router.push({ pathname: "/jobs/create", params: { id: String(job.id), jobType: job.type } })
              }
              onDelete={handleDelete}
              deleteTitle="채용 삭제"
              deleteDescription="채용을 삭제하시겠습니까?"
            />
          ) : null}
        </View>

        {job.contents ? <HtmlContent html={job.contents} /> : null}
      </ScrollView>

      {needsLogin ? (
        <View style={styles.loginOverlay}>
          <View style={styles.loginCard}>
            <Text style={styles.loginTitle}>로그인이 필요합니다.</Text>
            <Text style={styles.loginDesc}>채용 상세를 확인하려면 로그인이 필요합니다.</Text>
            <Button title="로그인" onPress={() => router.push("/auth/sign-in")} />
          </View>
        </View>
      ) : null}
    </>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },
  image: { width: "100%", height: 244, borderRadius: 12 },
  info: { paddingVertical: 8, gap: 8 },
  title: { marginTop: 16, fontSize: 20, fontWeight: "700", color: colors.black },
  badges: { flexDirection: "row", gap: 8, marginVertical: 4 },
  address: { fontSize: 14, fontWeight: "500", color: colors.coolgray },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { fontSize: 14, fontWeight: "500", color: colors.coolgray },
  link: { fontSize: 14, fontWeight: "700", color: colors.main },
  divider: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 32, minHeight: 2 },
  line: { flex: 1, height: 2, backgroundColor: colors.whitesmoke },
  loginOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loginCard: { width: "100%", backgroundColor: colors.white, borderRadius: 12, padding: 20, gap: 16 },
  loginTitle: { fontSize: 17, fontWeight: "700", color: colors.black, textAlign: "center" },
  loginDesc: { fontSize: 14, color: colors.silver, textAlign: "center" },
})

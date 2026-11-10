import { useQuery } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import React from "react"
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { CompetitionPoster } from "@/components/competitions/CompetitionCard"
import { useCompetitionMutation } from "@/components/competitions/useCompetitionMutation"
import { ItemManageBox } from "@/components/jobs/ItemManageBox"
import { ShareButton } from "@/components/jobs/ShareButton"
import { Button, EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { deleteCompetition } from "@/services/competitions"
import { APPLY_METHOD_LABEL, COMPETITION, PHASE_LABEL } from "@/types/competitions"

const filter = filters()
const PHASE_PILL: Record<string, { bg: string; fg: string }> = {
  OPEN: { bg: "#E6F7EF", fg: "#00A86B" },
  SOON: { bg: "#FDECEC", fg: "#E5484D" },
  UPCOMING: { bg: colors.tagBg, fg: colors.tagText },
  JUDGING: { bg: "#FFF3E0", fg: "#FF8A00" },
  CLOSED: { bg: colors.surface, fg: colors.muted },
}

/** 웹 app/(site)/competitions/[id] — 포스터·제목 → 핵심 표 → 일정 → 시상 → 소개, 하단 고정 접수 CTA */
export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const competitionId = Number(id)
  const { user } = useAuth()
  const { run } = useCompetitionMutation()
  const insets = useSafeAreaInsets()
  const { data: c, isLoading, isError, refetch, isRefetching } = useQuery(queries.competitions.detail(competitionId))

  if (isLoading)
    return (
      <>
        <Stack.Screen options={{ title: "콩쿠르" }} />
        <Loading style={{ flex: 1 }} />
      </>
    )
  if (isError || !c)
    return (
      <>
        <Stack.Screen options={{ title: "콩쿠르" }} />
        <EmptyDataMessage message="공고를 찾을 수 없거나 아직 게시되지 않았습니다." />
      </>
    )

  const isMine = !!user && user.id === c.authorId
  const canApply = c.phase === "OPEN" || c.phase === "SOON"
  const applyHref = c.applyMethod === "LINK" && c.applyLink ? c.applyLink : c.applyMethod === "EMAIL" && c.email ? `mailto:${c.email}` : null
  const big =
    c.phase === "UPCOMING"
      ? { value: `D-${c.openIn}`, sub: "접수 시작까지", hot: false }
      : canApply
        ? { value: c.dDay === 0 ? "오늘 마감" : `D-${c.dDay}`, sub: `${filter.YYYYMMDD(c.closeAt)} 23:59 마감`, hot: true }
        : c.phase === "JUDGING"
          ? { value: "심사중", sub: `대회 ${filter.YYYYMMDD(c.heldAt ?? c.closeAt)}`, hot: false }
          : { value: "종료", sub: `대회 ${filter.YYYYMMDD(c.heldAt ?? c.closeAt)}`, hot: false }

  const steps = [
    { label: "접수 시작", date: c.openAt, done: c.openIn <= 0 },
    { label: "접수 마감", date: c.closeAt, done: c.dDay < 0 },
    { label: "대회", date: c.heldAt, done: c.phase === "CLOSED" },
    { label: "결과 발표", date: c.resultAt, done: c.phase === "CLOSED" },
  ].filter(s => s.date)
  const nowIndex = steps.findIndex(s => !s.done)

  const apply = () => {
    if (!applyHref) return
    if (applyHref.startsWith("mailto:")) void Linking.openURL(applyHref)
    else void WebBrowser.openBrowserAsync(applyHref)
  }
  const handleDelete = async () => {
    const result = await run(() => deleteCompetition(c.id), "공고를 삭제했습니다.")
    if (result) router.back()
  }

  const facts: [string, string, string | null | undefined][] = [
    ["접수기간", `${filter.YYYYMMDD(c.openAt)} ~ ${filter.YYYYMMDD(c.closeAt)}`, "마감일 23:59 까지"],
    ["대회일", c.heldAt ? (filter.YYYYMMDD(c.heldAt) ?? c.heldAt) : "요강 참조", null],
    ["장소", c.venue ?? "요강 참조", c.area],
    ["부문·대상", c.divisions.join(" · "), c.ages.join(" · ") || null],
    ["참가비", c.fee ?? "요강 참조", null],
    ["접수 방법", APPLY_METHOD_LABEL[c.applyMethod], c.applyMethod === "EMAIL" ? c.email : null],
  ]

  return (
    <>
      <Stack.Screen options={{ title: "콩쿠르", headerRight: () => <ShareButton path={`/competitions/${c.id}`} title={c.title} /> }} />
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}>
        {isMine ? (
          <View style={styles.ownerBox}>
            <Text style={styles.ownerText}>내가 등록한 공고{c.status === "REVIEW" ? " · 검토 중 (나에게만 보여요)" : ` · 조회 ${c.viewCount}`}</Text>
            <ItemManageBox
              onEdit={() => router.push({ pathname: "/competitions/create", params: { id: String(c.id) } })}
              onDelete={handleDelete}
              deleteTitle="콩쿠르 삭제"
              deleteDescription="이 공고를 삭제할까요? 되돌릴 수 없습니다."
            />
          </View>
        ) : null}

        <View style={styles.head}>
          <View style={{ width: 100 }}>
            <CompetitionPoster competition={c} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <View style={styles.row}>
              <View style={[styles.pill, { backgroundColor: PHASE_PILL[c.phase].bg }]}>
                <Text style={[styles.pillText, { color: PHASE_PILL[c.phase].fg }]}>{PHASE_LABEL[c.phase]}</Text>
              </View>
              <Text style={c.source === "OWNER" ? styles.ownerSrc : styles.crawlSrc}>{c.source === "OWNER" ? `✓ 주최 등록${c.verified ? " · 인증" : ""}` : "수집 공고"}</Text>
            </View>
            <Text style={styles.title}>{c.title}</Text>
            <Text style={styles.host}>
              {c.host}
              {c.organizer ? ` · 주관 ${c.organizer}` : ""}
            </Text>
            <View style={[styles.row, { marginTop: 8 }]}>
              {[c.area, ...c.divisions, ...(c.ages.length ? [c.ages.length >= 4 ? "전연령" : c.ages.join("·")] : [])].map(t => (
                <View key={t} style={styles.tag}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.facts}>
          {facts.map(([k, v, s], i) => (
            <View key={k} style={[styles.fact, i > 0 && styles.factBorder]}>
              <Text style={styles.factKey}>{k}</Text>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.factValue}>{v}</Text>
                {s ? <Text style={styles.factSub}>{s}</Text> : null}
              </View>
            </View>
          ))}
        </View>

        {steps.length > 1 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>일정</Text>
            <View style={styles.timeline}>
              <View style={styles.timelineLine} />
              {steps.map((s, i) => (
                <View key={s.label} style={styles.step}>
                  <View style={[styles.dot, s.done && styles.dotDone, i === nowIndex && styles.dotNow]} />
                  <Text style={[styles.stepLabel, i === nowIndex && { color: colors.tagText }]}>{s.label}</Text>
                  <Text style={styles.stepDate}>{filter.YYYYMMDD(s.date, "YY.MM.DD")}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {c.prize ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시상</Text>
            <Text style={styles.prose}>{c.prize}</Text>
          </View>
        ) : null}
        {c.description ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>소개</Text>
            <Text style={styles.prose}>{c.description}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>문의</Text>
          <Text style={styles.contact}>주최 · {c.host}</Text>
          {c.tel ? <Text style={styles.contact}>전화 · {c.tel}</Text> : null}
          {c.email ? <Text style={styles.contact}>이메일 · {c.email}</Text> : null}
        </View>

        {c.source === "CRAWL" && c.sourceUrl ? (
          <Pressable onPress={() => void WebBrowser.openBrowserAsync(c.sourceUrl!)} style={styles.srcBox}>
            <Text style={styles.srcText}>
              <Text style={{ fontWeight: "700", color: colors.ink3 }}>수집 공고</Text> · 내용이 바뀌었을 수 있으니 접수 전 <Text style={{ color: colors.tagText, fontWeight: "600" }}>원문 보기 ↗</Text>로 확인해 주세요.
            </Text>
          </Pressable>
        ) : null}
        <Text style={styles.fine}>접수는 주최 측에서 진행합니다. 아트인포는 접수를 대행하지 않으며 참가비를 받지 않습니다.</Text>
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={{ minWidth: 72 }}>
          <Text style={[styles.ctaBig, big.hot && { color: "#E5484D" }]}>{big.value}</Text>
          <Text style={styles.ctaSub}>{big.sub}</Text>
        </View>
        {canApply && applyHref ? (
          <Button title={c.applyMethod === "EMAIL" ? "이메일로 접수하기" : "접수처 바로가기"} onPress={apply} style={{ flex: 1 }} />
        ) : (
          <Button
            title={canApply ? `접수 방법: ${APPLY_METHOD_LABEL[c.applyMethod]}` : c.phase === "UPCOMING" ? "아직 접수 전이에요" : "접수가 끝났어요"}
            variant="muted"
            disabled
            style={{ flex: 1 }}
          />
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 120 },
  ownerBox: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.tagBg, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16 },
  ownerText: { flex: 1, fontSize: 13, fontWeight: "600", color: colors.tagText },
  head: { flexDirection: "row", gap: 14 },
  row: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 },
  pill: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  pillText: { fontSize: 12, fontWeight: "700" },
  ownerSrc: { fontSize: 11, fontWeight: "700", color: colors.tagText },
  crawlSrc: { fontSize: 11, color: colors.coolgray },
  title: { marginTop: 6, fontSize: 19, fontWeight: "800", lineHeight: 26, color: colors.ink },
  host: { marginTop: 4, fontSize: 14, color: colors.ink3 },
  tag: { backgroundColor: colors.surface2, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  tagText: { fontSize: 12, color: colors.muted },
  facts: { marginTop: 22, borderWidth: 1, borderColor: colors.line, borderRadius: 16, overflow: "hidden" },
  fact: { flexDirection: "row", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  factBorder: { borderTopWidth: 1, borderTopColor: colors.surface },
  factKey: { width: 80, fontSize: 14, fontWeight: "500", color: colors.muted },
  factValue: { fontSize: 14, fontWeight: "500", color: colors.ink },
  factSub: { fontSize: 13, color: colors.muted, marginTop: 1 },
  section: { marginTop: 26 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: colors.ink, marginBottom: 12 },
  timeline: { flexDirection: "row" },
  timelineLine: { position: "absolute", left: 12, right: 12, top: 9, height: 2, backgroundColor: colors.line },
  step: { flex: 1, paddingTop: 24, paddingRight: 4 },
  dot: { position: "absolute", left: 0, top: 3, width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: colors.line, backgroundColor: colors.white },
  dotDone: { borderColor: colors.ink, backgroundColor: colors.ink },
  dotNow: { borderColor: colors.main, backgroundColor: colors.main },
  stepLabel: { fontSize: 12, fontWeight: "700", color: colors.ink },
  stepDate: { fontSize: 11, color: colors.muted, marginTop: 2 },
  prose: { fontSize: 14, lineHeight: 24, color: colors.ink3 },
  contact: { fontSize: 14, lineHeight: 22, color: colors.ink3 },
  srcBox: { marginTop: 22, backgroundColor: colors.surface2, borderRadius: 12, padding: 12 },
  srcText: { fontSize: 13, lineHeight: 20, color: colors.muted },
  fine: { marginTop: 16, fontSize: 12, lineHeight: 18, color: colors.coolgray },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white },
  ctaBig: { fontSize: 17, fontWeight: "800", color: colors.ink },
  ctaSub: { fontSize: 11, color: colors.muted },
})

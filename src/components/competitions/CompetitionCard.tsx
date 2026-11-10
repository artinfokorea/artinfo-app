import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { COMPETITION, DIVISION_COLOR, PHASE_LABEL } from "@/types/competitions"

const filter = filters()

/** 포스터 위에 얹는 D-day 또는 상태 배지 */
export const PhaseBadge = ({ competition: c }: { competition: COMPETITION }) => {
  if (c.phase === "UPCOMING")
    return (
      <View style={styles.badgeDark}>
        <Text style={styles.badgeDarkText}>접수 D-{c.openIn}</Text>
      </View>
    )
  if (c.phase === "OPEN" || c.phase === "SOON")
    return (
      <View style={[styles.badgeDark, c.phase === "SOON" && { backgroundColor: "#E5484D" }]}>
        <Text style={styles.badgeDarkText}>{c.dDay === 0 ? "오늘 마감" : `D-${c.dDay}`}</Text>
      </View>
    )
  return (
    <View style={styles.badgeLight}>
      <Text style={styles.badgeLightText}>{PHASE_LABEL[c.phase]}</Text>
    </View>
  )
}

/** 포스터(3:4) — 없으면 부문 색 블록에 부문·연도 */
export const CompetitionPoster = ({ competition: c, width }: { competition: COMPETITION; width?: number }) => {
  const main = c.divisions[0] ?? "종합"
  const label = c.divisions.length > 1 ? "종합" : main
  const year = (c.heldAt ?? c.closeAt).slice(0, 4)
  return (
    <View style={[styles.poster, width ? { width } : { width: "100%" }]}>
      {c.posterUrl ? (
        <FallbackImage src={c.posterUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.posterFallback, { backgroundColor: DIVISION_COLOR[main] ?? DIVISION_COLOR["종합"] }]}>
          <Text style={styles.posterFallbackText}>
            {label} · {year}
          </Text>
        </View>
      )}
      <View style={styles.badgeWrap}>
        <PhaseBadge competition={c} />
      </View>
      {c.source === "OWNER" && c.verified ? (
        <View style={styles.verified}>
          <Text style={styles.verifiedText}>주최 ✓</Text>
        </View>
      ) : null}
    </View>
  )
}

export const competitionSubText = (c: COMPETITION) =>
  c.phase === "UPCOMING"
    ? `${filter.YYYYMMDD(c.openAt, "YY.MM.DD")} 접수 시작`
    : c.phase === "OPEN" || c.phase === "SOON"
      ? `${filter.YYYYMMDD(c.closeAt, "YY.MM.DD")} 마감 · ${c.area}`
      : `대회 ${filter.YYYYMMDD(c.heldAt ?? c.closeAt, "YY.MM.DD")} · ${c.area}`

type Props = {
  competition: COMPETITION
  /** 홈 가로 줄처럼 폭을 고정할 때 */
  width?: number
  compact?: boolean
  style?: object
}

/** 콩쿠르 포스터 카드 — 목록(2열)과 홈 섹션(가로 줄)이 같이 쓴다. 웹 components/competitions/CompetitionCard */
export const CompetitionCard = ({ competition: c, width, compact, style }: Props) => (
  <Pressable
    onPress={() => router.push(`/competitions/${c.id}`)}
    style={[{ flex: width ? undefined : 1, minWidth: 0 }, width ? { width } : null, style]}
    accessibilityRole="button"
  >
    <CompetitionPoster competition={c} />
    <Text style={[styles.title, compact && { fontSize: 14 }]} numberOfLines={2}>
      {c.title}
    </Text>
    {!compact ? (
      <Text style={styles.host} numberOfLines={1}>
        {c.host}
      </Text>
    ) : null}
    <Text style={styles.sub} numberOfLines={1}>
      {competitionSubText(c)}
    </Text>
  </Pressable>
)

const styles = StyleSheet.create({
  poster: { aspectRatio: 3 / 4, borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface },
  posterFallback: { justifyContent: "flex-end", padding: 10 },
  posterFallbackText: { color: colors.white, fontSize: 13, fontWeight: "800", lineHeight: 16 },
  badgeWrap: { position: "absolute", left: 8, top: 8 },
  badgeDark: { backgroundColor: "rgba(25,31,40,0.75)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeDarkText: { color: colors.white, fontSize: 11, fontWeight: "800" },
  badgeLight: { backgroundColor: "rgba(255,255,255,0.9)", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeLightText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  verified: { position: "absolute", right: 8, bottom: 8, backgroundColor: colors.main, borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  verifiedText: { color: colors.white, fontSize: 10, fontWeight: "800" },
  title: { marginTop: 8, fontSize: 15, fontWeight: "700", lineHeight: 20, color: colors.ink },
  host: { marginTop: 2, fontSize: 13, color: colors.ink3 },
  sub: { marginTop: 2, fontSize: 12, color: colors.muted },
})

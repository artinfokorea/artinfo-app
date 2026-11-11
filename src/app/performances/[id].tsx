import { useQuery, useQueryClient } from "@tanstack/react-query"
import * as WebBrowser from "expo-web-browser"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useState } from "react"
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { ItemManageBox } from "@/components/lessons/ListParts"
import { KakaoMapView } from "@/components/performances/KakaoMapView"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { HtmlContent } from "@/components/ui/HtmlContent"
import { Icon } from "@/components/ui/Icon"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { deletePerformance } from "@/services/performances"
import { AREA } from "@/types/performances"
import { showActionSheet } from "@/lib/action-sheet"

const filter = filters()

const DetailItem = ({ title, content }: { title: string; content?: string | number | null }) => (
  <View style={styles.item}>
    <Text style={styles.itemTitle}>{title}</Text>
    <Text style={styles.itemContent}>{content ?? ""}</Text>
  </View>
)

/** 지도 앱(iOS: Apple 지도, Android: 구글 지도 / 카카오맵)으로 열어 길찾기 */
const openMap = (area: AREA, label: string) => {
  const name = encodeURIComponent(label)
  const system =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?ll=${area.latitude},${area.longitude}&q=${name}`
      : `geo:${area.latitude},${area.longitude}?q=${area.latitude},${area.longitude}(${name})`
  const kakao = `https://map.kakao.com/link/map/${name},${area.latitude},${area.longitude}`
  showActionSheet(
    { options: [Platform.OS === "ios" ? "Apple 지도" : "구글 지도", "카카오맵", "취소"], cancelButtonIndex: 2, title: label },
    index => {
      if (index === 0) Linking.openURL(system)
      if (index === 1) Linking.openURL(kakao)
    },
  )
}

/** 웹 components/performances/PerformanceDetailContainer */
export default function PerformanceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const performanceId = Number(id)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [tab, setTab] = useState<"intro" | "area">("intro")

  const { data: performance, isLoading } = useQuery(queries.performances.detail(performanceId))

  const handleDelete = async () => {
    try {
      await deletePerformance(performanceId)
      successToast("공연이 삭제되었습니다.")
      queryClient.invalidateQueries({ queryKey: queries.performances._def })
      router.back()
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? error.message)
    }
  }

  if (isLoading) return <Loading />
  if (!performance) return <EmptyDataMessage message="공연 정보를 찾을 수 없습니다." />

  const isAuthor = !!user && user.id === performance.authorId
  const area = performance.area
  const placeName = performance.customAreaName || area?.name

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
      <Stack.Screen options={{ title: "공연" }} />
      <Text style={styles.title}>{performance.title}</Text>

      <FallbackImage src={performance.posterImageUrl} style={styles.poster} contentFit="cover" />

      <View style={{ marginVertical: 32, gap: 12 }}>
        <DetailItem
          title="공연기간"
          content={`${filter.YYYYMMDD(performance.startAt, "YYYY.MM.DD (ddd)")} ~ ${filter.YYYYMMDD(
            performance.endAt,
            "YYYY.MM.DD (ddd)",
          )}`}
        />
        <DetailItem title="공연장소" content={placeName} />
        <DetailItem title="공연시간" content={performance.time} />
        <DetailItem title="관람연령" content={performance.age} />
        <DetailItem title="티켓가격" content={performance.ticketPrice} />
        <DetailItem title="출연진" content={performance.cast} />
        <DetailItem title="주관 ∙ 주최" content={performance.host} />
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.line} />
        {performance.reservationUrl ? (
          <Pressable onPress={() => WebBrowser.openBrowserAsync(performance.reservationUrl)} hitSlop={6}>
            <Text style={styles.reservation}>예매처 바로가기</Text>
          </Pressable>
        ) : null}
        <View style={styles.line} />
        {isAuthor ? (
          <ItemManageBox
            onEdit={() => router.push(`/performances/create?id=${performance.id}`)}
            onDelete={handleDelete}
            deleteTitle="공연 삭제"
            deleteMessage="공연을 삭제하시겠습니까?"
          />
        ) : null}
      </View>

      <View style={styles.tabs}>
        <TabButton label="소개" selected={tab === "intro"} onPress={() => setTab("intro")} />
        {area ? <TabButton label="공연장" selected={tab === "area"} onPress={() => setTab("area")} /> : null}
      </View>

      {tab === "intro" || !area ? (
        <View style={{ paddingVertical: 24 }}>
          {performance.introduction ? <HtmlContent html={performance.introduction} /> : null}
        </View>
      ) : (
        <View style={{ paddingVertical: 24 }}>
          <Text style={{ fontWeight: "600", fontSize: 16 }}>{area.name}</Text>
          <View style={{ marginVertical: 24, gap: 12 }}>
            <DetailItem title="좌석수" content={`${area.seatScale}석`} />
            <DetailItem title="시설특성" content={area.type} />
            <DetailItem title="주소" content={area.address} />
            <View style={styles.item}>
              <Text style={styles.itemTitle}>홈페이지</Text>
              {area.siteUrl ? (
                <Text
                  style={[styles.itemContent, { color: colors.indigo500, textDecorationLine: "underline" }]}
                  onPress={() => WebBrowser.openBrowserAsync(area.siteUrl)}
                >
                  {area.siteUrl}
                </Text>
              ) : (
                <Text style={styles.itemContent} />
              )}
            </View>
          </View>
          <KakaoMapView
            latitude={area.latitude}
            longitude={area.longitude}
            label={placeName || area.name}
            style={{ marginBottom: 12 }}
          />
          <Pressable style={styles.mapButton} onPress={() => openMap(area, placeName || area.name)}>
            <Icon name="map" size={18} color={colors.main} />
            <Text style={{ color: colors.main, fontWeight: "700" }}>지도 앱에서 길찾기</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  )
}

const TabButton = ({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) => (
  <Pressable onPress={onPress} style={[styles.tab, selected ? styles.tabSelected : styles.tabIdle]}>
    <Text style={{ color: selected ? colors.main : colors.black, fontWeight: "500", fontSize: 14 }}>
      {label}
    </Text>
  </Pressable>
)

const styles = StyleSheet.create({
  title: { fontSize: 20, textAlign: "center", marginVertical: 24, color: colors.black },
  poster: { width: 240, height: 320, borderRadius: 6, alignSelf: "center" },
  item: { flexDirection: "row" },
  itemTitle: { flexBasis: "25%", fontWeight: "600", color: colors.grayfont, fontSize: 14 },
  itemContent: { flex: 1, fontWeight: "500", fontSize: 14, color: colors.black },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  line: { flex: 1, height: 2, backgroundColor: colors.whitesmoke },
  reservation: { fontSize: 16, fontWeight: "700", color: colors.main },
  tabs: {
    flexDirection: "row",
    marginTop: 32,
    borderWidth: 1,
    borderColor: colors.whitesmoke,
    borderRadius: 4,
    overflow: "hidden",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  tabSelected: { backgroundColor: colors.white, borderTopWidth: 2, borderTopColor: colors.main },
  tabIdle: { backgroundColor: colors.whitesmoke },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderWidth: 1,
    borderColor: colors.main,
    borderRadius: 8,
  },
})

import { useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native"

import { ArtRow } from "@/components/home/ArtRow"
import { BannerCarousel } from "@/components/home/BannerCarousel"
import { NewsPreview, PostPreview } from "@/components/home/HomePreviews"
import { LessonBanner } from "@/components/home/LessonBanner"
import { MainJobsRow } from "@/components/home/MainJobsRow"
import { colors } from "@/constants/theme"
import { AdvertisementType } from "@/types/ads"

/** 웹 app/(site)/page.tsx: 배너 → 공연 → 나눔/뉴스 → 채용 → 레슨 배너 → 전시 */
export default function HomeScreen() {
  const queryClient = useQueryClient()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["ads"] }),
        queryClient.refetchQueries({ queryKey: ["jobs"] }),
        queryClient.refetchQueries({ queryKey: ["posts"] }),
        queryClient.refetchQueries({ queryKey: ["news"] }),
      ])
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.white }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <BannerCarousel />
      <ArtRow type={AdvertisementType.CONCERT} title="공연" />
      <View style={styles.community}>
        <PostPreview />
        <NewsPreview />
      </View>
      <MainJobsRow />
      <LessonBanner />
      <ArtRow type={AdvertisementType.EXHIBITION} title="전시" />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 40 },
  community: { marginVertical: 24, gap: 32 },
})

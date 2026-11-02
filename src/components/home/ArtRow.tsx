import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import * as WebBrowser from "expo-web-browser"
import React from "react"
import { FlatList, Pressable, StyleSheet, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { SectionHeader } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { AdvertisementType } from "@/types/ads"

type Props = {
  type: AdvertisementType
  title: string
}

/** 웹 components/main/MainArtContainer (모바일): 2:3 포스터 가로 스크롤, 폭 200 */
export const ArtRow = ({ type, title }: Props) => {
  const { data: arts = [] } = useQuery(queries.ads.list(type))

  return (
    <View style={styles.section}>
      <SectionHeader title={title} onMore={() => router.navigate("/performances")} />
      <FlatList
        data={arts}
        keyExtractor={art => String(art.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 16 }}
        ItemSeparatorComponent={() => <View style={{ width: 10 }} />}
        ListEmptyComponent={
          <View style={{ flexDirection: "row", gap: 10 }}>
            {[0, 1].map(i => (
              <View key={i} style={[styles.poster, { backgroundColor: colors.whitesmoke }]} />
            ))}
          </View>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => item.redirectUrl && WebBrowser.openBrowserAsync(item.redirectUrl)}>
            <FallbackImage src={item.imageUrl} style={styles.poster} />
          </Pressable>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  section: { marginVertical: 24 },
  poster: { width: 200, aspectRatio: 2 / 3, borderRadius: 6 },
})

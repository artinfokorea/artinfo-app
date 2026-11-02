import { useQuery } from "@tanstack/react-query"
import * as WebBrowser from "expo-web-browser"
import React, { useEffect, useRef, useState } from "react"
import { FlatList, NativeScrollEvent, NativeSyntheticEvent, Pressable, StyleSheet, useWindowDimensions, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { AD, AdvertisementType } from "@/types/ads"

const GUTTER = 16
const AUTOPLAY_MS = 5000

/** 웹 components/main/BannerContainer: 4:1 배너 캐러셀, 5초 자동 넘김, 손으로 넘기면 자동 넘김 중지 */
export const BannerCarousel = () => {
  const { width } = useWindowDimensions()
  const itemWidth = width - GUTTER * 2
  const listRef = useRef<FlatList<AD>>(null)
  const [index, setIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  const { data: ads = [] } = useQuery(queries.ads.list(AdvertisementType.BANNER))

  useEffect(() => {
    if (!autoplay || ads.length < 2) return
    const timer = setInterval(() => {
      setIndex(prev => {
        const next = (prev + 1) % ads.length
        listRef.current?.scrollToOffset({ offset: next * itemWidth, animated: true })
        return next
      })
    }, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [autoplay, ads.length, itemWidth])

  if (ads.length === 0) {
    return <View style={[styles.skeleton, { width: itemWidth, height: itemWidth / 4 }]} />
  }

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIndex(Math.round(event.nativeEvent.contentOffset.x / itemWidth))
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={ads}
        keyExtractor={ad => String(ad.id)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => setAutoplay(false)}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, i) => ({ length: itemWidth, offset: itemWidth * i, index: i })}
        style={{ width: itemWidth, borderRadius: 12 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => item.redirectUrl && WebBrowser.openBrowserAsync(item.redirectUrl)}
            style={{ width: itemWidth, aspectRatio: 4 }}
          >
            <FallbackImage src={item.imageUrl} style={styles.image} />
          </Pressable>
        )}
      />
      {ads.length > 1 ? (
        <View style={styles.dots}>
          {ads.map((ad, i) => (
            <View key={ad.id} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { marginVertical: 24, alignItems: "center" },
  skeleton: { marginVertical: 24, borderRadius: 12, backgroundColor: colors.whitesmoke },
  image: { width: "100%", height: "100%", borderRadius: 12 },
  dots: { flexDirection: "row", gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gray300 },
  dotActive: { backgroundColor: colors.main, width: 14 },
})

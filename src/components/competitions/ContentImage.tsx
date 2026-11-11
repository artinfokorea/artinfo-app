import React, { useEffect, useState } from "react"
import { Image, StyleSheet, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"

/** 본문 이미지 — 원본 비율대로 가로 꽉 채워 보여준다 (공고문·요강 그림) */
export const ContentImage = ({ url }: { url: string }) => {
  const [ratio, setRatio] = useState(3 / 4)
  useEffect(() => {
    let alive = true
    Image.getSize(
      url,
      (w, h) => {
        if (alive && w > 0 && h > 0) setRatio(w / h)
      },
      () => undefined,
    )
    return () => {
      alive = false
    }
  }, [url])
  return (
    <View style={[styles.box, { aspectRatio: ratio }]}>
      <FallbackImage src={url} style={StyleSheet.absoluteFill} contentFit="contain" />
    </View>
  )
}

const styles = StyleSheet.create({
  box: { width: "100%", borderRadius: 12, overflow: "hidden", backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.surface },
})

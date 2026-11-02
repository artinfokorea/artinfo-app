import { Image, ImageProps } from "expo-image"
import React, { useState } from "react"
import { StyleSheet, Text, View } from "react-native"

import { colors } from "@/constants/theme"

type Props = Omit<ImageProps, "source"> & {
  src?: string | null
  /** 이미지가 없을 때 대신 보여줄 텍스트 (예: 기관명) */
  fallbackText?: string
  fallbackSource?: ImageProps["source"]
}

const placeholderUser = require("@/assets/images/placeholder-user.png")

/** 웹 components/common/FallbackImage 와 같은 동작: src 가 없거나 깨지면 대체 이미지/텍스트 */
export const FallbackImage = ({
  src,
  fallbackText,
  fallbackSource = placeholderUser,
  style,
  contentFit = "cover",
  ...props
}: Props) => {
  const [error, setError] = useState(false)

  if ((!src || error) && fallbackText) {
    return (
      <View style={[styles.fallback, style as any]}>
        <Text style={styles.fallbackText} numberOfLines={2}>
          {fallbackText}
        </Text>
      </View>
    )
  }

  return (
    <Image
      source={!src || error ? fallbackSource : { uri: src }}
      style={style}
      contentFit={contentFit}
      transition={150}
      onError={() => setError(true)}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    padding: 8,
  },
  fallbackText: {
    fontFamily: "Georgia",
    fontWeight: "700",
    fontSize: 16,
    color: colors.black,
    textAlign: "center",
  },
})

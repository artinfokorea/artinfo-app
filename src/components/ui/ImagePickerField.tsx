import * as ImagePicker from "expo-image-picker"
import React, { useState } from "react"
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { uploadImages } from "@/services/system"
import { UploadTarget } from "@/types"

/** 사진 보관함에서 이미지를 고르고 서버(/system/upload/images)에 올린 뒤 URL 을 돌려준다. */
export const pickAndUploadImage = async (
  target: UploadTarget,
  options?: { aspect?: [number, number] },
): Promise<string | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 0.8,
    allowsEditing: !!options?.aspect,
    aspect: options?.aspect,
  })
  if (result.canceled || !result.assets?.[0]) return null
  const asset = result.assets[0]
  const uploaded = await uploadImages(target, [
    {
      uri: asset.uri,
      name: asset.fileName ?? `image_${Date.now()}.jpg`,
      type: asset.mimeType ?? "image/jpeg",
    },
  ])
  return uploaded.images[0]?.url ?? null
}

type Props = {
  label?: string
  value?: string
  onChange: (url: string) => void
  target: UploadTarget
  aspectRatio?: number
  aspect?: [number, number]
  error?: string
  style?: StyleProp<ViewStyle>
}

/** 웹 components/common/ImageField 대체: 미리보기 + 탭해서 업로드 */
export const ImagePickerField = ({
  label,
  value,
  onChange,
  target,
  aspectRatio = 1,
  aspect,
  error,
  style,
}: Props) => {
  const [uploading, setUploading] = useState(false)
  const { errorToast } = useToast()

  const onPress = async () => {
    try {
      setUploading(true)
      const url = await pickAndUploadImage(target, { aspect })
      if (url) onChange(url)
    } catch {
      errorToast("이미지 업로드에 실패했습니다.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={[{ gap: 6 }, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={onPress} style={[styles.box, { aspectRatio }, !!error && { borderColor: colors.error }]}>
        {value ? (
          <FallbackImage src={value} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={{ alignItems: "center", gap: 6 }}>
            <Icon name="camera" size={28} color={colors.gray400} />
            <Text style={{ color: colors.gray400, fontSize: 13 }}>이미지 선택</Text>
          </View>
        )}
        {uploading ? (
          <View style={[StyleSheet.absoluteFill, styles.overlay]}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : null}
      </Pressable>
      {error ? <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: "600", color: colors.gray800 },
  box: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderStyle: "dashed",
    backgroundColor: colors.gray50,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  overlay: { backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
})

import { router, Stack } from "expo-router"
import React, { useState } from "react"
import { StyleSheet, Text, View } from "react-native"

import { getErrorMessage } from "@/components/auth/ControlledField"
import { FormScreen } from "@/components/auth/FormScreen"
import { PerformanceInquiryForm } from "@/components/inquiry/PerformanceInquiryForm"
import { useToast } from "@/components/ui/Toast"
import { PerformanceInquiryPayload } from "@/interface/inquiries"
import { createPerformanceInquiry } from "@/services/inquries"

/** 웹 app/(site)/performance-inquiry (기획 문의) */
export default function PerformanceInquiryScreen() {
  const [isLoading, setIsLoading] = useState(false)
  const { successToast, errorToast } = useToast()

  const handleInquiry = async (payload: PerformanceInquiryPayload) => {
    try {
      setIsLoading(true)
      await createPerformanceInquiry(payload)
      successToast("기획 문의가 성공적으로 등록되었습니다.")
      router.navigate("/")
    } catch (error: any) {
      errorToast(getErrorMessage(error, "기획 문의 등록에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormScreen>
      <Stack.Screen options={{ title: "기획" }} />
      {/* 웹의 indigo → purple → pink 그라데이션 배너. 그라데이션 라이브러리 없이 겹친 원으로 표현 */}
      <View style={styles.hero}>
        <View style={[styles.bubble, { left: -40, top: -40, width: 160, height: 160 }]} />
        <View style={[styles.bubble, { right: -40, bottom: -40, width: 128, height: 128, backgroundColor: "#ec4899" }]} />
        <View style={[styles.bubble, { left: "25%", top: "50%", width: 80, height: 80 }]} />
        <Text style={styles.emoji}>🎵 🎹 🎻</Text>
        <Text style={styles.heroTitle}>아티스트의 연주를 응원합니다</Text>
        <Text style={styles.heroSubtitle}>공연 기획이 필요하시면 문의해주세요</Text>
      </View>
      <PerformanceInquiryForm handleInquiry={handleInquiry} isLoading={isLoading} />
    </FormScreen>
  )
}

const styles = StyleSheet.create({
  hero: {
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 24,
    paddingVertical: 48,
    alignItems: "center",
    marginBottom: 8,
  },
  bubble: { position: "absolute", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)" },
  emoji: { fontSize: 30, marginBottom: 16 },
  heroTitle: { fontSize: 24, fontWeight: "700", color: "#fff", textAlign: "center" },
  heroSubtitle: { marginTop: 12, fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center" },
})

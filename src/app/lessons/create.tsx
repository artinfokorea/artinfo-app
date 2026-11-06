import { yupResolver } from "@hookform/resolvers/yup"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"
import * as yup from "yup"

import { DistrictSheet } from "@/components/lessons/DistrictSheet"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { Icon } from "@/components/ui/Icon"
import { ImagePickerField } from "@/components/ui/ImagePickerField"
import { Button, Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { lessonSchema } from "@/lib/schemas"
import { createLesson, getLessonQualification, updateLesson } from "@/services/lessons"
import { UploadTarget } from "@/types"

type LessonFormData = yup.InferType<typeof lessonSchema>

/** 웹 app/(site)/lessons/create + LessonForm. `?id=` 가 있으면 수정 모드 (웹의 ?type=edit) */
export default function LessonCreateScreen() {
  // 로그인이 필요한 화면 (웹 middleware 의 /*/create 와 같음)
  useSignInRedirect()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const lessonId = id ? Number(id) : undefined
  const isEdit = !!lessonId
  const { isReady, isLoggedIn } = useAuth()
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [isDistrictOpen, setIsDistrictOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: lesson, isLoading } = useQuery({
    ...queries.lessons.detail(lessonId ?? 0),
    enabled: isEdit,
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: yupResolver(lessonSchema),
    defaultValues: { areas: [], imageUrl: "", introduction: "", career: "" },
  })

  // 로그인 확인 (웹 middleware 의 /*/create 보호)
  useEffect(() => {
    if (isReady && !isLoggedIn) router.replace("/auth/sign-in")
  }, [isReady, isLoggedIn])

  // 등록 자격 확인 (웹: getLessonQualification 실패 시 다이얼로그)
  useEffect(() => {
    if (isEdit || !isLoggedIn) return
    getLessonQualification().catch((error: any) => {
      const code = error?.response?.data?.code
      const message = error?.response?.data?.message
      if (code === "LESSON-003") {
        Alert.alert("레슨 등록 제한", message, [
          { text: "리스트로 이동하기", onPress: () => router.back() },
        ])
      } else {
        Alert.alert("레슨 등록 권한이 없습니다.", message, [
          { text: "프로필로 이동하기", onPress: () => router.replace("/my-profile") },
        ])
      }
    })
  }, [isEdit, isLoggedIn])

  useEffect(() => {
    if (lesson) {
      reset({
        areas: lesson.areas ?? [],
        pay: lesson.pay,
        imageUrl: lesson.imageUrl,
        introduction: lesson.introduction,
        career: lesson.career,
      })
    }
  }, [lesson, reset])

  const areas = (watch("areas") ?? []) as string[]

  const handleArea = (area: string) => {
    if (areas.includes(area)) {
      setValue("areas", areas.filter(prev => prev !== area), { shouldValidate: true })
    } else {
      // 최대 3개 — 넘치면 가장 먼저 고른 지역을 뺀다 (웹과 동일)
      const next = areas.length >= 3 ? [...areas.slice(1), area] : [...areas, area]
      setValue("areas", next, { shouldValidate: true })
    }
  }

  const onSubmit = async (form: LessonFormData) => {
    const payload = {
      areas: form.areas as string[],
      pay: Number(form.pay),
      imageUrl: form.imageUrl,
      introduction: form.introduction,
      career: form.career || "",
    }
    try {
      setIsSubmitting(true)
      if (isEdit) {
        await updateLesson(payload)
        successToast("레슨이 수정되었습니다.")
      } else {
        await createLesson(payload)
        successToast("레슨이 등록되었습니다.")
      }
      await queryClient.invalidateQueries({ queryKey: queries.lessons._def })
      router.back()
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEdit && isLoading) return <Loading />

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <Stack.Screen options={{ title: isEdit ? "레슨 수정" : "레슨 등록" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <ImagePickerField
              value={field.value}
              onChange={url => {
                field.onChange(url)
                successToast("레슨 이미지가 등록되었습니다.")
              }}
              target={UploadTarget.LESSON}
              aspectRatio={3 / 4}
              aspect={[3, 4]}
              error={errors.imageUrl?.message}
              style={{ width: 240, alignSelf: "center" }}
            />
          )}
        />

        <Text style={styles.heading}>레슨 등록</Text>

        <View style={styles.row}>
          <Text style={styles.label}>가격</Text>
          <Controller
            control={control}
            name="pay"
            render={({ field }) => (
              <TextInput
                value={field.value === undefined || field.value === null ? "" : String(field.value)}
                onChangeText={text => field.onChange(text.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                style={[styles.payInput, !!errors.pay && { borderColor: colors.error }]}
              />
            )}
          />
          <Text style={{ fontSize: 18 }}>원</Text>
          <Text style={{ fontSize: 12 }}>(1회)</Text>
        </View>
        {errors.pay ? <Text style={styles.error}>{errors.pay.message}</Text> : null}

        <View style={[styles.row, { marginTop: 16 }]}>
          <Text style={styles.label}>지역</Text>
          <Button title="지역 등록" variant="outline" size="sm" onPress={() => setIsDistrictOpen(true)} />
          <Text style={styles.hint}>최대 3개까지 등록 가능합니다.</Text>
        </View>
        <View style={[styles.areaBox, !!errors.areas && { borderColor: colors.error }]}>
          {areas.map(area => (
            <View key={area} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text>{area}</Text>
              <Pressable onPress={() => handleArea(area)} hitSlop={8}>
                <Icon name="xmark" size={13} color={colors.gray500} />
              </Pressable>
            </View>
          ))}
        </View>
        {errors.areas ? <Text style={styles.error}>{errors.areas.message}</Text> : null}

        <View style={{ height: 2, backgroundColor: colors.whitesmoke, marginVertical: 24 }} />

        <Controller
          control={control}
          name="introduction"
          render={({ field }) => (
            <View style={styles.panel}>
              <Text style={styles.panelTitle}>전문가 소개</Text>
              <TextInput
                value={field.value}
                onChangeText={field.onChange}
                multiline
                placeholder="전문가 소개를 입력해주세요."
                placeholderTextColor={colors.gray400}
                style={styles.textarea}
              />
              {errors.introduction ? <Text style={styles.error}>{errors.introduction.message}</Text> : null}
            </View>
          )}
        />
        <Controller
          control={control}
          name="career"
          render={({ field }) => (
            <View style={[styles.panel, { marginTop: 16 }]}>
              <Text style={styles.panelTitle}>경력</Text>
              <TextInput
                value={field.value ?? ""}
                onChangeText={field.onChange}
                multiline
                placeholder="경력 사항을 입력해주세요."
                placeholderTextColor={colors.gray400}
                style={styles.textarea}
              />
            </View>
          )}
        />

        <View style={styles.actions}>
          <Button title="취소" variant="outline" style={styles.actionButton} onPress={() => router.back()} />
          <Button
            title={isEdit ? "수정" : "등록"}
            style={styles.actionButton}
            loading={isSubmitting}
            onPress={() => handleSubmit(onSubmit)()}
          />
        </View>
      </ScrollView>

      <DistrictSheet
        visible={isDistrictOpen}
        onClose={() => setIsDistrictOpen(false)}
        onSelect={handleArea}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  heading: { fontSize: 20, fontWeight: "700", marginTop: 24, marginBottom: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  label: { fontSize: 15, fontWeight: "700" },
  payInput: {
    flex: 1,
    minWidth: 120,
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  hint: { fontSize: 12, color: colors.silver, fontWeight: "500" },
  areaBox: {
    marginTop: 8,
    minHeight: 100,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  panel: { backgroundColor: colors.whitesmoke, borderRadius: 6, padding: 16 },
  panelTitle: { fontWeight: "600", color: colors.coolgray, marginBottom: 12, fontSize: 15 },
  textarea: {
    minHeight: 240,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    textAlignVertical: "top",
  },
  error: { color: colors.error, fontSize: 12, fontWeight: "600", marginTop: 4 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 32 },
  actionButton: { width: 88, borderRadius: 999 },
})

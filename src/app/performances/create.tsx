import { yupResolver } from "@hookform/resolvers/yup"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack, useLocalSearchParams } from "expo-router"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native"
import * as yup from "yup"

import { PerformanceAreaModal } from "@/components/performances/PerformanceAreaModal"
import { ImagePickerField } from "@/components/ui/ImagePickerField"
import { Button, Chip, Loading } from "@/components/ui/primitives"
import { RichEditor } from "@/components/ui/RichEditor"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { performanceSchema } from "@/lib/schemas"
import { createPerformance, updatePerformance } from "@/services/performances"
import { UploadTarget } from "@/types"
import { PerformanceCategory, performanceCategoryArray } from "@/types/performances"

const filter = filters()

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// 웹은 <input type="date"> 를 쓰므로 앱에서는 YYYY-MM-DD 형식을 직접 검사한다
const schema = performanceSchema.shape({
  startAt: yup
    .string()
    .required("시작일을 입력해주세요.")
    .matches(DATE_REGEX, "YYYY-MM-DD 형식으로 입력해주세요."),
  endAt: yup
    .string()
    .required("종료일을 입력해주세요.")
    .matches(DATE_REGEX, "YYYY-MM-DD 형식으로 입력해주세요."),
})

type PerformanceFormData = yup.InferType<typeof schema>

/** 숫자만 입력하면 YYYY-MM-DD 로 하이픈을 넣어준다 */
const formatDateInput = (text: string) => {
  const digits = text.replace(/[^0-9]/g, "").slice(0, 8)
  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
}

/** 웹 app/(site)/performances/create + PerformanceForm. `?id=` 가 있으면 수정 모드 */
export default function PerformanceCreateScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>()
  const performanceId = id ? Number(id) : undefined
  const isEdit = !!performanceId
  const { isReady, isLoggedIn } = useAuth()
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [category, setCategory] = useState<PerformanceCategory | null>(null)
  const [isDirectInput, setIsDirectInput] = useState(false)
  const [isAreaOpen, setIsAreaOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: performance, isLoading } = useQuery({
    ...queries.performances.detail(performanceId ?? 0),
    enabled: isEdit,
  })

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<PerformanceFormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      title: "",
      posterImageUrl: "",
      startAt: "",
      endAt: "",
      time: "",
      customAreaName: "",
      area: null,
      age: "",
      ticketPrice: "",
      cast: "",
      host: "",
      reservationUrl: "",
      introduction: "",
    },
  })

  useEffect(() => {
    if (isReady && !isLoggedIn) router.replace("/auth/sign-in")
  }, [isReady, isLoggedIn])

  useEffect(() => {
    if (!performance) return
    reset({
      title: performance.title,
      posterImageUrl: performance.posterImageUrl || "",
      startAt: performance.startAt ? (filter.YYYYMMDD(performance.startAt, "YYYY-MM-DD") as string) : "",
      endAt: performance.endAt ? (filter.YYYYMMDD(performance.endAt, "YYYY-MM-DD") as string) : "",
      time: performance.time || "",
      customAreaName: performance.customAreaName || "",
      area: (performance.area as any) || null,
      age: performance.age || "",
      ticketPrice: performance.ticketPrice || "",
      cast: performance.cast || "",
      host: performance.host || "",
      reservationUrl: performance.reservationUrl || "",
      introduction: performance.introduction || "",
    })
  }, [performance, reset])

  const area = watch("area")
  const customAreaName = watch("customAreaName")

  const onSubmit = async (form: PerformanceFormData) => {
    if (!isEdit && !category) {
      errorToast("공연 분야를 선택해주세요.")
      return
    }
    const payload = {
      // 웹도 수정 시 CLASSIC 으로 보낸다 (상세 응답에 분야가 없음)
      category: isEdit ? PerformanceCategory.CLASSIC : (category as PerformanceCategory),
      title: form.title,
      posterImageUrl: form.posterImageUrl,
      startAt: form.startAt,
      endAt: form.endAt,
      time: form.time,
      customAreaName: form.customAreaName || "",
      areaId: form.area?.id || undefined,
      age: form.age,
      ticketPrice: form.ticketPrice,
      cast: form.cast,
      host: form.host,
      reservationUrl: form.reservationUrl || "",
      introduction: form.introduction,
    }
    try {
      setIsSubmitting(true)
      if (isEdit && performanceId) {
        await updatePerformance(performanceId, payload)
        successToast("공연이 수정되었습니다.")
        await queryClient.invalidateQueries({ queryKey: queries.performances._def })
        router.back()
      } else {
        const response: any = await createPerformance(payload)
        successToast("공연이 등록되었습니다.")
        await queryClient.invalidateQueries({ queryKey: queries.performances._def })
        const newId = response?.item?.id ?? response?.id
        if (newId) router.replace(`/performances/${newId}`)
        else router.back()
      }
    } catch (error: any) {
      errorToast(error?.response?.data?.message ?? error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isEdit && isLoading) return <Loading />

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <Stack.Screen options={{ title: isEdit ? "공연 수정" : "공연 등록" }} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {!isEdit ? (
          <View style={{ marginBottom: 16, gap: 8 }}>
            <Text style={styles.sectionLabel}>공연 선택</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {performanceCategoryArray.map(item => (
                <Chip
                  key={item.value}
                  label={item.title}
                  selected={category === item.value}
                  onPress={() => setCategory(item.value)}
                />
              ))}
            </View>
          </View>
        ) : null}

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <UnderlineInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="제목을 입력해주세요."
              error={errors.title?.message}
              style={{ fontSize: 18 }}
            />
          )}
        />

        <Controller
          control={control}
          name="posterImageUrl"
          render={({ field }) => (
            <ImagePickerField
              value={field.value}
              onChange={url => {
                field.onChange(url)
                successToast("공연 이미지가 등록되었습니다.")
              }}
              target={UploadTarget.USER}
              aspectRatio={3 / 4}
              error={errors.posterImageUrl?.message}
              style={{ width: 225, alignSelf: "center", marginTop: 16 }}
            />
          )}
        />

        <View style={{ marginTop: 16, gap: 10 }}>
          <Row label="공연기간">
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Controller
                control={control}
                name="startAt"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={text => field.onChange(formatDateInput(text))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.gray400}
                    keyboardType="number-pad"
                    style={styles.dateInput}
                  />
                )}
              />
              <Text>~</Text>
              <Controller
                control={control}
                name="endAt"
                render={({ field }) => (
                  <TextInput
                    value={field.value}
                    onChangeText={text => field.onChange(formatDateInput(text))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.gray400}
                    keyboardType="number-pad"
                    style={styles.dateInput}
                  />
                )}
              />
            </View>
            <ErrorText message={errors.startAt?.message} />
            <ErrorText message={errors.endAt?.message} />
          </Row>

          <Row label="공연장소">
            {isDirectInput ? (
              <Controller
                control={control}
                name="customAreaName"
                render={({ field }) => (
                  <TextInput
                    value={field.value ?? ""}
                    onChangeText={field.onChange}
                    placeholder="공연장소를 입력해주세요."
                    placeholderTextColor={colors.gray400}
                    style={styles.boxInput}
                  />
                )}
              />
            ) : (
              <Text style={{ fontSize: 15, minHeight: 20 }}>{area?.name || customAreaName}</Text>
            )}
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <Button
                title="장소검색"
                variant="outline"
                size="sm"
                onPress={() => {
                  setIsDirectInput(false)
                  setIsAreaOpen(true)
                }}
              />
              <Button
                title="직접입력"
                variant="outline"
                size="sm"
                onPress={() => {
                  setValue("area", null)
                  setIsDirectInput(true)
                }}
              />
            </View>
            <ErrorText message={errors.customAreaName?.message ?? (errors.area as any)?.id?.message} />
          </Row>

          <TextRow control={control} name="time" label="공연시간" placeholder="예) 일요일(17:00)" error={errors.time?.message} />
          <TextRow control={control} name="age" label="관람연령" placeholder="예) 12세 이상" error={errors.age?.message} />
          <TextRow
            control={control}
            name="ticketPrice"
            label="티켓가격"
            placeholder="예) R석 110,000원 / S석 90,000원"
            error={errors.ticketPrice?.message}
          />
          <TextRow control={control} name="cast" label="출연진" placeholder="예) 손열음" error={errors.cast?.message} />
          <TextRow
            control={control}
            name="host"
            label="주관 ∙ 주최"
            placeholder="주관 ∙ 주최를 입력해주세요."
            error={errors.host?.message}
          />
          <TextRow
            control={control}
            name="reservationUrl"
            label="예매처 주소"
            placeholder="예매처 주소를 입력해주세요."
            error={errors.reservationUrl?.message}
            inputProps={{ autoCapitalize: "none", keyboardType: "url", autoCorrect: false }}
          />
        </View>

        <Text style={[styles.sectionLabel, { textAlign: "center", marginTop: 32, marginBottom: 16, color: colors.grayfont }]}>
          공연 소개
        </Text>
        <Controller
          control={control}
          name="introduction"
          render={({ field }) => (
            <RichEditor
              initialHtml={performance?.introduction ?? ""}
              onChange={field.onChange}
              uploadTarget={UploadTarget.USER}
              error={errors.introduction?.message}
            />
          )}
        />

        <View style={styles.actions}>
          <Button title="취소" variant="outline" size="sm" style={styles.actionButton} onPress={() => router.back()} />
          <Button
            title={isEdit ? "수정" : "등록"}
            size="sm"
            style={styles.actionButton}
            loading={isSubmitting}
            onPress={() => handleSubmit(onSubmit)()}
          />
        </View>
      </ScrollView>

      <PerformanceAreaModal
        visible={isAreaOpen}
        onClose={() => setIsAreaOpen(false)}
        onSelect={selected => {
          setValue("area", selected as any)
          setValue("customAreaName", "")
          clearErrors()
        }}
      />
    </KeyboardAvoidingView>
  )
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <View style={{ flex: 1 }}>{children}</View>
  </View>
)

const ErrorText = ({ message }: { message?: string }) =>
  message ? <Text style={styles.error}>{message}</Text> : null

const UnderlineInput = ({ error, style, ...props }: TextInputProps & { error?: string }) => (
  <View>
    <TextInput placeholderTextColor={colors.gray400} style={[styles.underline, style]} {...props} />
    <ErrorText message={error} />
  </View>
)

const TextRow = ({
  control,
  name,
  label,
  placeholder,
  error,
  inputProps,
}: {
  control: any
  name: keyof PerformanceFormData
  label: string
  placeholder: string
  error?: string
  inputProps?: TextInputProps
}) => (
  <Row label={label}>
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <UnderlineInput
          value={(field.value as string) ?? ""}
          onChangeText={field.onChange}
          placeholder={placeholder}
          error={error}
          {...inputProps}
        />
      )}
    />
  </Row>
)

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 48 },
  sectionLabel: { fontSize: 16, fontWeight: "600", color: colors.gray800 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  rowLabel: { width: 76, paddingTop: 8, fontWeight: "600", color: colors.grayfont, fontSize: 14 },
  underline: {
    borderBottomWidth: 2,
    borderBottomColor: colors.whitesmoke,
    paddingVertical: 8,
    fontSize: 15,
    color: colors.black,
  },
  dateInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  boxInput: {
    height: 36,
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 15,
  },
  error: { color: colors.error, fontSize: 12, fontWeight: "600", marginTop: 2 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 32 },
  actionButton: { borderRadius: 999, paddingHorizontal: 24 },
})

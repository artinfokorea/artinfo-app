import { yupResolver } from "@hookform/resolvers/yup"
import dayjs from "dayjs"
import { router } from "expo-router"
import React, { useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native"

import { FieldError, formStyles, MajorPickerRow, OutlineButton, UnderlineInput } from "@/components/jobs/FormFields"
import { MajorSelectSheet } from "@/components/jobs/MajorSelectSheet"
import { Icon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/primitives"
import { RichEditor } from "@/components/ui/RichEditor"
import { colors } from "@/constants/theme"
import { partTimeSchema } from "@/lib/schemas"
import { UploadTarget } from "@/types"
import { JOB } from "@/types/jobs"
import { MAJOR } from "@/types/majors"

export type PartTimeSchedule = { date: string; startTime: string; endTime: string }

export type PartTimeFormData = {
  title: string
  companyName: string
  fee: number
  address: string
  addressDetail: string
  contents: string
  majors: MAJOR[]
  schedules: PartTimeSchedule[]
}

/** 폼 일정(날짜 + 시작/종료 시각) → API 일정(startAt/endAt) */
export const toApiSchedules = (schedules: PartTimeSchedule[]) =>
  schedules.map(schedule => ({
    startAt: dayjs(`${schedule.date}T${schedule.startTime}`).toDate(),
    endAt: dayjs(`${schedule.date}T${schedule.endTime}`).toDate(),
  }))

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^\d{2}:\d{2}$/

type Props = {
  onSubmit: (data: PartTimeFormData) => void
  isLoading: boolean
  partTime?: JOB
}

/**
 * 웹 components/jobs/PartTimeForm. 날짜/시간은 웹의 date/time input 대신
 * "YYYY-MM-DD", "HH:mm" 형식의 텍스트로 입력받는다.
 */
export const PartTimeForm = ({ onSubmit, isLoading, partTime }: Props) => {
  const [isMajorOpen, setIsMajorOpen] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm<PartTimeFormData>({
    resolver: yupResolver(partTimeSchema) as any,
    defaultValues: {
      title: partTime?.title ?? "",
      companyName: partTime?.companyName ?? "",
      fee: partTime?.fee,
      address: partTime?.address ?? "",
      addressDetail: partTime?.addressDetail ?? "",
      contents: partTime?.contents ?? "",
      schedules: partTime?.schedules?.length
        ? partTime.schedules.map(schedule => ({
            date: dayjs(schedule.startAt).format("YYYY-MM-DD"),
            startTime: dayjs(schedule.startAt).format("HH:mm"),
            endTime: dayjs(schedule.endAt).format("HH:mm"),
          }))
        : [{ date: "", startTime: "", endTime: "" }],
      majors: partTime?.majors?.majors ?? [],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: "schedules" })
  const majors = watch("majors") ?? []

  const toggleMajor = (major: MAJOR) => {
    const exists = majors.some(m => m.id === major.id)
    setValue("majors", exists ? majors.filter(m => m.id !== major.id) : [...majors, major], {
      shouldValidate: true,
    })
  }

  // 텍스트로 입력받으므로 형식을 한 번 더 검사한다
  const submit = handleSubmit(data => {
    const invalidIndex = data.schedules.findIndex(
      s => !DATE_RE.test(s.date) || !TIME_RE.test(s.startTime) || !TIME_RE.test(s.endTime),
    )
    if (invalidIndex >= 0) {
      setError(`schedules.${invalidIndex}.date`, {
        message: "날짜는 YYYY-MM-DD, 시간은 HH:mm 형식으로 입력해주세요.",
      })
      return
    }
    onSubmit(data)
  })

  const scheduleErrors = errors.schedules as any

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Text style={formStyles.heading}>{partTime ? "구인 수정" : "구인 등록"}</Text>

        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <UnderlineInput value={field.value} onChangeText={field.onChange} placeholder="제목을 입력해주세요." error={errors.title?.message} />
          )}
        />
        <Controller
          control={control}
          name="companyName"
          render={({ field }) => (
            <UnderlineInput
              value={field.value}
              onChangeText={field.onChange}
              placeholder="단체 이름을 입력해주세요."
              error={errors.companyName?.message}
            />
          )}
        />

        <View style={styles.feeRow}>
          <Text style={styles.label}>금액</Text>
          <Controller
            control={control}
            name="fee"
            render={({ field }) => (
              <TextInput
                value={field.value === undefined || field.value === null ? "" : String(field.value)}
                onChangeText={text => field.onChange(text.replace(/[^0-9]/g, ""))}
                keyboardType="number-pad"
                style={styles.feeInput}
              />
            )}
          />
          <Text style={{ fontSize: 18 }}>원</Text>
        </View>
        <FieldError message={errors.fee?.message} />

        <View style={{ marginTop: 16 }}>
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <UnderlineInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="주소를 입력해주세요. 예) 서울 종로구 세종대로 175"
                error={errors.address?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="addressDetail"
            render={({ field }) => (
              <UnderlineInput
                value={field.value}
                onChangeText={field.onChange}
                placeholder="상세 주소를 입력해주세요."
                error={errors.addressDetail?.message}
              />
            )}
          />
        </View>

        <View style={{ marginTop: 16, gap: 8 }}>
          <OutlineButton title="날짜 추가" icon="plus" onPress={() => append({ date: "", startTime: "", endTime: "" })} />
          {fields.map((item, index) => (
            <View key={item.id}>
              <View style={styles.scheduleRow}>
                <Controller
                  control={control}
                  name={`schedules.${index}.date`}
                  render={({ field }) => (
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={colors.gray400}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                      style={[styles.scheduleInput, { width: 116 }]}
                    />
                  )}
                />
                <Controller
                  control={control}
                  name={`schedules.${index}.startTime`}
                  render={({ field }) => (
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="HH:mm"
                      placeholderTextColor={colors.gray400}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                      style={[styles.scheduleInput, { width: 70 }]}
                    />
                  )}
                />
                <Text>~</Text>
                <Controller
                  control={control}
                  name={`schedules.${index}.endTime`}
                  render={({ field }) => (
                    <TextInput
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="HH:mm"
                      placeholderTextColor={colors.gray400}
                      keyboardType="numbers-and-punctuation"
                      maxLength={5}
                      style={[styles.scheduleInput, { width: 70 }]}
                    />
                  )}
                />
                {index > 0 ? (
                  <Pressable onPress={() => remove(index)} style={styles.trash} hitSlop={6}>
                    <Icon name="trash" size={14} color={colors.gray600} />
                  </Pressable>
                ) : null}
              </View>
              <FieldError
                message={
                  scheduleErrors?.[index]?.date?.message ||
                  scheduleErrors?.[index]?.startTime?.message ||
                  scheduleErrors?.[index]?.endTime?.message
                }
              />
            </View>
          ))}
          <FieldError message={scheduleErrors?.message} />
        </View>

        <View style={{ marginTop: 8 }}>
          <MajorPickerRow
            majors={majors}
            onPress={() => setIsMajorOpen(true)}
            emptyText="전공을 선택해주세요."
            error={errors.majors?.message as string | undefined}
            collapse={false}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <RichEditor
            initialHtml={partTime?.contents ?? ""}
            onChange={html => setValue("contents", html, { shouldValidate: !!errors.contents })}
            uploadTarget={UploadTarget.JOB}
          />
          <FieldError message={errors.contents?.message} />
        </View>

        <View style={formStyles.actions}>
          <Button
            title="취소"
            variant="outline"
            size="sm"
            style={[formStyles.pill, { borderColor: colors.gray200 }]}
            textStyle={{ color: colors.black }}
            onPress={() => router.back()}
          />
          <Button title={partTime ? "수정" : "등록"} size="sm" style={formStyles.pill} loading={isLoading} onPress={() => submit()} />
        </View>
      </ScrollView>

      <MajorSelectSheet
        visible={isMajorOpen}
        onClose={() => setIsMajorOpen(false)}
        selectedMajors={majors}
        onToggle={toggleMajor}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "700", color: colors.grayfont },
  feeRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  feeInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    color: colors.black,
  },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleInput: {
    height: 36,
    borderWidth: 1,
    borderColor: colors.black,
    borderRadius: 4,
    paddingHorizontal: 6,
    fontSize: 14,
    color: colors.black,
  },
  trash: { padding: 6, borderWidth: 1, borderColor: colors.gray200, borderRadius: 4 },
})

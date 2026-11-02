import { yupResolver } from "@hookform/resolvers/yup"
import { router } from "expo-router"
import React, { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native"

import { FieldError, formStyles, MajorPickerRow, UnderlineInput } from "@/components/jobs/FormFields"
import { MajorSelectSheet } from "@/components/jobs/MajorSelectSheet"
import { ImagePickerField } from "@/components/ui/ImagePickerField"
import { Button } from "@/components/ui/primitives"
import { RichEditor } from "@/components/ui/RichEditor"
import { colors } from "@/constants/theme"
import { jobSchema } from "@/lib/schemas"
import { UploadTarget } from "@/types"
import { JOB } from "@/types/jobs"
import { MAJOR } from "@/types/majors"

export type FullTimeJobFormData = {
  title: string
  companyName: string
  recruitSiteUrl?: string | null
  address: string
  addressDetail: string
  imageUrl?: string | null
  contents: string
  majors: MAJOR[]
}

type Props = {
  onSubmit: (data: FullTimeJobFormData) => void
  isLoading: boolean
  job?: JOB
  /** 종교 공고는 이미지 없이 등록 */
  withImage?: boolean
}

/** 웹 components/jobs/FullTimeJobForm. 주소는 다음 우편번호 검색 대신 직접 입력한다. */
export const FullTimeJobForm = ({ onSubmit, isLoading, job, withImage = true }: Props) => {
  const [isMajorOpen, setIsMajorOpen] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FullTimeJobFormData>({
    resolver: yupResolver(jobSchema) as any,
    defaultValues: {
      majors: job?.majors?.majors || [],
      title: job?.title || "",
      companyName: job?.companyName || "",
      addressDetail: job?.addressDetail || "",
      contents: job?.contents || "",
      address: job?.address || "",
      imageUrl: job?.imageUrl || "",
      recruitSiteUrl: job?.recruitSiteUrl || "",
    },
  })

  const majors = watch("majors") ?? []

  const toggleMajor = (major: MAJOR) => {
    const exists = majors.some(m => m.id === major.id)
    setValue("majors", exists ? majors.filter(m => m.id !== major.id) : [...majors, major], {
      shouldValidate: true,
    })
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <Text style={formStyles.heading}>{job ? "채용 수정" : "채용 등록"}</Text>

        {withImage ? (
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ImagePickerField
                value={field.value || ""}
                onChange={field.onChange}
                target={UploadTarget.JOB}
                aspectRatio={400 / 244}
                style={{ marginBottom: 16 }}
              />
            )}
          />
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
            />
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
        <Controller
          control={control}
          name="recruitSiteUrl"
          render={({ field }) => (
            <UnderlineInput
              value={field.value ?? ""}
              onChangeText={field.onChange}
              placeholder="사이트 주소를 입력해주세요. 예): https://naver.com"
              autoCapitalize="none"
              keyboardType="url"
              error={errors.recruitSiteUrl?.message}
            />
          )}
        />

        <MajorPickerRow
          majors={majors}
          onPress={() => setIsMajorOpen(true)}
          emptyText="전공은 최대 3개까지 선택 가능합니다."
          error={errors.majors?.message as string | undefined}
        />

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

        <View style={{ marginTop: 16 }}>
          <RichEditor
            initialHtml={job?.contents ?? ""}
            onChange={html => setValue("contents", html, { shouldValidate: !!errors.contents })}
            uploadTarget={UploadTarget.JOB}
          />
          <FieldError message={errors.contents?.message} />
        </View>

        <View style={formStyles.actions}>
          <Button title="취소" variant="outline" size="sm" style={[formStyles.pill, { borderColor: colors.gray200 }]} textStyle={{ color: colors.black }} onPress={() => router.back()} />
          <Button
            title={job ? "수정" : "등록"}
            size="sm"
            style={formStyles.pill}
            loading={isLoading}
            onPress={() => handleSubmit(onSubmit)()}
          />
        </View>
      </ScrollView>

      <MajorSelectSheet
        visible={isMajorOpen}
        onClose={() => setIsMajorOpen(false)}
        selectedMajors={majors}
        onToggle={toggleMajor}
        max={3}
      />
    </KeyboardAvoidingView>
  )
}

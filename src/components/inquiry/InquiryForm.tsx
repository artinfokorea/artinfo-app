import { yupResolver } from "@hookform/resolvers/yup"
import { router } from "expo-router"
import React from "react"
import { useForm } from "react-hook-form"
import { StyleSheet, Text, View } from "react-native"
import * as yup from "yup"

import { ControlledField, emailInputProps } from "@/components/auth/ControlledField"
import { Button } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"

const schema = yup
  .object({
    title: yup.string().min(3, "제목은 3글자이상 입력해주세요.").required("제목은 필수입력사항 입니다."),
    email: yup.string().email("이메일 형식이 아닙니다.").required("이메일을 입력해주세요."),
    contents: yup.string().min(3, "내용은 10글자이상 입력해주세요.").required("내용은 필수입력사항 입니다."),
  })
  .required()

export type InquiryFormData = yup.InferType<typeof schema>

type Props = {
  handleInquiry: (payload: InquiryFormData) => void
  isLoading: boolean
}

/** 웹 components/inquiry/InquiryForm */
export const InquiryForm = ({ handleInquiry, isLoading }: Props) => {
  const { control, handleSubmit } = useForm<InquiryFormData>({ resolver: yupResolver(schema) })

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={inquiryStyles.heading}>문의하기</Text>
        <Text style={inquiryStyles.subheading}>문의사항이 있으시면 아래 양식을 작성해주세요.</Text>
      </View>
      <ControlledField control={control} name="title" label="제목" placeholder="제목 내용을 입력해주세요" />
      <ControlledField
        control={control}
        name="email"
        label="이메일"
        placeholder="답변받으실 이메일을 입력해주세요."
        {...emailInputProps}
      />
      <ControlledField
        control={control}
        name="contents"
        label="문의 내용"
        placeholder="문의 내용을 입력해주세요."
        multiline
        style={{ minHeight: 200 }}
      />
      <FormActions isLoading={isLoading} onSubmit={handleSubmit(handleInquiry)} />
    </View>
  )
}

export const FormActions = ({ isLoading, onSubmit }: { isLoading: boolean; onSubmit: () => void }) => (
  <View style={inquiryStyles.actions}>
    <Button
      title="취소"
      variant="muted"
      style={inquiryStyles.actionButton}
      onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))}
    />
    <Button title="등록" loading={isLoading} style={inquiryStyles.actionButton} onPress={onSubmit} />
  </View>
)

export const inquiryStyles = StyleSheet.create({
  heading: { fontSize: 20, fontWeight: "700", color: colors.black },
  subheading: { marginTop: 8, fontSize: 14, color: colors.gray500 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 4 },
  actionButton: { borderRadius: 999, width: 88 },
})

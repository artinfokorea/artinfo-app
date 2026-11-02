import { yupResolver } from "@hookform/resolvers/yup"
import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { Pressable, StyleSheet, Text, View } from "react-native"
import * as yup from "yup"

import { ControlledField, emailInputProps } from "@/components/auth/ControlledField"
import { FormActions, inquiryStyles } from "@/components/inquiry/InquiryForm"
import { Icon } from "@/components/ui/Icon"
import { SelectSheet } from "@/components/ui/SelectSheet"
import { colors } from "@/constants/theme"
import { PerformanceInquiryPayload } from "@/interface/inquiries"
import { queries } from "@/lib/queries"

const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/[^\d]/g, "")
  if (numbers.length <= 3) return numbers
  if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

const schema = yup
  .object({
    name: yup.string().min(2, "이름은 2글자 이상 입력해주세요.").required("이름은 필수입력사항 입니다."),
    email: yup.string().email("이메일 형식이 아닙니다.").required("이메일을 입력해주세요."),
    phone: yup
      .string()
      .matches(/^[0-9]{3}-[0-9]{4}-[0-9]{4}$/, "연락처를 정확히 입력해주세요.")
      .required("연락처는 필수입력사항 입니다."),
    ensembleType: yup.string().min(2, "편성은 2글자 이상 입력해주세요.").required("편성은 필수입력사항 입니다."),
    contents: yup.string().optional(),
  })
  .required()

type FormData = yup.InferType<typeof schema>

type Props = {
  handleInquiry: (payload: PerformanceInquiryPayload) => void
  isLoading: boolean
}

/** 웹 components/inquiry/PerformanceInquiryForm */
export const PerformanceInquiryForm = ({ handleInquiry, isLoading }: Props) => {
  const [isProvinceOpen, setIsProvinceOpen] = useState(false)
  const [selectedProvinceIds, setSelectedProvinceIds] = useState<number[]>([])
  const { data: provinceData } = useQuery(queries.provinces.list())

  const { control, handleSubmit } = useForm<FormData>({ resolver: yupResolver(schema) })

  const selectedProvinceNames = provinceData?.provinces
    ?.filter(province => selectedProvinceIds.includes(province.id))
    .map(province => province.name)
    .join(", ")

  const onSubmit = (data: FormData) =>
    handleInquiry({
      ...data,
      contents: data.contents || "",
      provinceIds: selectedProvinceIds,
    })

  return (
    <View style={{ gap: 16 }}>
      <View>
        <Text style={inquiryStyles.heading}>기획 문의</Text>
        <Text style={inquiryStyles.subheading}>공연 기획 문의가 있으시면 아래 양식을 작성해주세요.</Text>
      </View>
      <ControlledField control={control} name="name" label="이름" placeholder="이름을 입력해주세요" />
      <ControlledField
        control={control}
        name="email"
        label="이메일"
        placeholder="답변받으실 이메일을 입력해주세요"
        {...emailInputProps}
      />
      <ControlledField
        control={control}
        name="phone"
        label="연락처"
        placeholder="01012345678"
        keyboardType="number-pad"
        textContentType="telephoneNumber"
        maxLength={13}
        format={formatPhoneNumber}
      />
      <ControlledField
        control={control}
        name="ensembleType"
        label="편성"
        placeholder="예: 피아노 솔로, 현악 4중주"
      />
      <View style={{ gap: 6 }}>
        <Text style={styles.label}>
          지역선택 <Text style={styles.optional}>(선택사항)</Text>
        </Text>
        <Pressable style={styles.select} onPress={() => setIsProvinceOpen(true)}>
          <Text
            style={{ flex: 1, color: selectedProvinceIds.length ? colors.black : colors.gray400 }}
            numberOfLines={2}
          >
            {selectedProvinceIds.length > 0 ? selectedProvinceNames : "지역을 선택해주세요 (복수 선택 가능)"}
          </Text>
          <Icon name="chevron.down" size={14} color={colors.gray400} />
        </Pressable>
      </View>
      <ControlledField
        control={control}
        name="contents"
        label="문의 내용 (선택사항)"
        placeholder="공연 기획 관련 문의 내용을 입력해주세요."
        multiline
        style={{ minHeight: 200 }}
      />
      <FormActions isLoading={isLoading} onSubmit={handleSubmit(onSubmit)} />

      <SelectSheet
        visible={isProvinceOpen}
        title="지역 선택"
        multiple
        options={(provinceData?.provinces ?? []).map(province => ({
          label: province.name,
          value: province.id,
        }))}
        selected={selectedProvinceIds}
        onClose={() => setIsProvinceOpen(false)}
        onConfirm={setSelectedProvinceIds}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: "600", color: colors.gray800 },
  optional: { color: colors.gray400, fontWeight: "400" },
  select: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
})

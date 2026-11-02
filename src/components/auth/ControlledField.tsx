import React from "react"
import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { StyleProp, TextInputProps, ViewStyle } from "react-native"

import { TextField } from "@/components/ui/primitives"

type Props<T extends FieldValues> = Omit<TextInputProps, "value" | "onChangeText"> & {
  control: Control<T>
  name: Path<T>
  label?: string
  required?: boolean
  right?: React.ReactNode
  containerStyle?: StyleProp<ViewStyle>
  /** 입력값을 저장하기 전에 바꾼다 (예: 전화번호 하이픈) */
  format?: (value: string) => string
}

/** react-hook-form 과 TextField 를 연결한 입력 필드 (웹의 InputField 대응) */
export function ControlledField<T extends FieldValues>({
  control,
  name,
  format,
  ...props
}: Props<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => (
        <TextField
          value={value ?? ""}
          onChangeText={text => onChange(format ? format(text) : text)}
          onBlur={onBlur}
          error={error?.message}
          {...props}
        />
      )}
    />
  )
}

/** 영문 이메일/비밀번호 입력에 공통으로 쓰는 속성 */
export const emailInputProps: TextInputProps = {
  keyboardType: "email-address",
  autoCapitalize: "none",
  autoCorrect: false,
  textContentType: "emailAddress",
  autoComplete: "email",
}

export const passwordInputProps: TextInputProps = {
  secureTextEntry: true,
  autoCapitalize: "none",
  autoCorrect: false,
  textContentType: "password",
}

/** axios 에러에서 서버 메시지를 꺼낸다 */
export const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || fallback

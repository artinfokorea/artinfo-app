import { yupResolver } from "@hookform/resolvers/yup"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Text } from "react-native"
import * as yup from "yup"

import { ControlledField, passwordInputProps } from "@/components/auth/ControlledField"
import { DialogSheet } from "@/components/profile/DialogSheet"
import { Button, TextField } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { passwordRegex } from "@/lib/schemas"

const PASSWORD_MESSAGE = "8자 이상 12자 이하로 영문, 숫자, 특수문자를 포함해주세요."

const schema = yup
  .object({
    isEmailVerified: yup.boolean().oneOf([true], "이메일 인증을 완료해주세요.").default(false),
    password: yup
      .string()
      .min(8, PASSWORD_MESSAGE)
      .max(12, PASSWORD_MESSAGE)
      .required()
      .matches(passwordRegex, PASSWORD_MESSAGE),
    rePassword: yup
      .string()
      .required("재확인 비밀번호를 입력해주세요.")
      .oneOf([yup.ref("password")], "재확인 비밀번호가 일치 하지 않습니다."),
  })
  .required()

export type PasswordFormData = yup.InferType<typeof schema>

type Props = {
  visible: boolean
  onClose: () => void
  isLoading: boolean
  handlePassword: (payload: PasswordFormData) => void
  sendEmailVerifyCode: () => Promise<void>
  checkEmailVerifyCode: (code: string) => Promise<void>
}

/** 웹 components/dialog/PasswordDialog — 가입 이메일 인증 후 비밀번호 변경 */
export const PasswordSheet = ({
  visible,
  onClose,
  isLoading,
  handlePassword,
  sendEmailVerifyCode,
  checkEmailVerifyCode,
}: Props) => {
  const [isSendEmail, setIsSendEmail] = useState(false)
  const [isVerifyEmail, setIsVerifyEmail] = useState(false)
  const [verifyCode, setVerifyCode] = useState("")

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(schema),
    defaultValues: { isEmailVerified: false },
  })

  useEffect(() => {
    if (!visible) {
      reset({ isEmailVerified: false, password: "", rePassword: "" })
      setIsSendEmail(false)
      setIsVerifyEmail(false)
      setVerifyCode("")
    }
  }, [visible, reset])

  const sendEmail = async () => {
    try {
      setIsVerifyEmail(false)
      await sendEmailVerifyCode()
      setIsSendEmail(true)
    } catch {
      // 토스트는 상위에서 띄운다
    }
  }

  const checkEmail = async () => {
    setIsSendEmail(false)
    try {
      await checkEmailVerifyCode(verifyCode)
      setValue("isEmailVerified", true, { shouldValidate: true })
      setIsVerifyEmail(true)
    } catch {
      // 토스트는 상위에서 띄운다
    }
  }

  return (
    <DialogSheet
      visible={visible}
      title="비밀번호 변경"
      onClose={onClose}
      footer={<Button title="비밀번호 변경" loading={isLoading} onPress={() => handleSubmit(handlePassword)()} />}
    >
      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.silver }}>
        가입한 이메일로 인증번호를 보내드립니다.
      </Text>
      <TextField
        label="이메일 인증 코드"
        value={verifyCode}
        onChangeText={setVerifyCode}
        placeholder="인증 코드를 입력해주세요."
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
        error={errors.isEmailVerified?.message}
        right={
          <>
            <Button
              title="인증"
              size="sm"
              onPress={checkEmail}
              disabled={verifyCode.length !== 6 || isVerifyEmail}
            />
            <Button title="요청" size="sm" variant="outline" onPress={sendEmail} disabled={isSendEmail} />
          </>
        }
      />
      <ControlledField
        control={control}
        name="password"
        label="패스워드"
        placeholder="비밀번호를 입력해주세요."
        {...passwordInputProps}
        textContentType="newPassword"
      />
      <ControlledField
        control={control}
        name="rePassword"
        label="패스워드 확인"
        placeholder="비밀번호를 입력해주세요."
        {...passwordInputProps}
        textContentType="newPassword"
      />
    </DialogSheet>
  )
}

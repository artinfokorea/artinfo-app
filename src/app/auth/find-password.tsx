import { yupResolver } from "@hookform/resolvers/yup"
import { router, Stack } from "expo-router"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Text } from "react-native"
import * as yup from "yup"

import {
  ControlledField,
  emailInputProps,
  getErrorMessage,
  passwordInputProps,
} from "@/components/auth/ControlledField"
import { FormScreen } from "@/components/auth/FormScreen"
import { Button, TextField } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { findPasswordSchema } from "@/lib/schemas"
import {
  checkEmailVerificationCode,
  isDuplicateEmail,
  sendEmailVerificationCode,
} from "@/services/auth"
import { updateUserPassword } from "@/services/users"

type PasswordFormData = yup.InferType<typeof findPasswordSchema>

/** 웹 app/(auth)/auth/find-password + components/auth/FIndPasswordForm */
export default function FindPasswordScreen() {
  const { successToast, errorToast } = useToast()
  const [isSendEmail, setIsSendEmail] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [verifyCode, setVerifyCode] = useState("")
  const [isVerify, setIsVerify] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    getFieldState,
    formState: { errors },
  } = useForm<PasswordFormData>({
    resolver: yupResolver(findPasswordSchema),
    mode: "onChange",
    defaultValues: { isEmailVerified: false },
  })

  const email = watch("email")

  useEffect(() => {
    setIsVerify(false)
    setIsSendEmail(false)
    setValue("isEmailVerified", false)
  }, [email, setValue])

  const sendEmail = async () => {
    try {
      setIsSending(true)
      setIsVerify(false)
      const response: { existence: boolean } = await isDuplicateEmail(getValues("email"))
      if (!response.existence) {
        errorToast("존재하지 않는 이메일입니다.")
        return
      }
      await sendEmailVerificationCode(getValues("email"))
      successToast("인증코드가 전송되었습니다.")
      setIsSendEmail(true)
    } catch {
      errorToast("인증코드 전송에 실패했습니다.")
    } finally {
      setIsSending(false)
    }
  }

  const checkEmail = async () => {
    try {
      setIsSendEmail(false)
      await checkEmailVerificationCode(getValues("email"), verifyCode)
      successToast("이메일 인증이 완료되었습니다.")
      setIsVerify(true)
      setValue("isEmailVerified", true, { shouldValidate: true })
    } catch (error: any) {
      if (error?.response?.data?.code === "VERIFICATION-001") {
        errorToast(error.response.data.message)
      } else {
        errorToast("이메일 인증에 실패했습니다.")
      }
    }
  }

  const handleUserPassword = async (payload: PasswordFormData) => {
    try {
      setIsLoading(true)
      await updateUserPassword(payload.password, payload.email)
      successToast("비밀번호 변경이 완료되었습니다.")
      router.replace("/auth/sign-in")
    } catch (error: any) {
      errorToast(getErrorMessage(error, "비밀번호 변경에 실패했습니다."))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <FormScreen showLogo>
      <Stack.Screen options={{ title: "비밀번호 찾기" }} />
      <ControlledField
        control={control}
        name="email"
        label="이메일"
        placeholder="이메일을 입력하세요."
        {...emailInputProps}
        right={
          <Button
            title="인증코드 전송"
            size="sm"
            loading={isSending}
            onPress={sendEmail}
            disabled={!email || isSendEmail || getFieldState("email").invalid}
          />
        }
      />
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
          <Button
            title={isVerify ? "인증 완료" : "인증"}
            size="sm"
            onPress={checkEmail}
            disabled={verifyCode.length !== 6 || isVerify}
          />
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
      <Text style={{ color: colors.gray500, fontSize: 12 }}>
        8자 이상 12자 이하로 영문, 숫자, 특수문자를 포함해주세요.
      </Text>
      <Button title="비밀번호 변경" loading={isLoading} onPress={() => handleSubmit(handleUserPassword)()} />
    </FormScreen>
  )
}

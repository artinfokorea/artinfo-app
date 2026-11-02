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
import { Button } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { signUpSchema } from "@/lib/schemas"
import {
  checkEmailVerificationCode,
  isDuplicateEmail,
  sendEmailVerificationCode,
  signUp,
} from "@/services/auth"

type FormData = yup.InferType<typeof signUpSchema>

/** 웹 components/auth/SignUpForm */
export default function SignUpScreen() {
  const { successToast, errorToast } = useToast()
  const [isPending, setIsPending] = useState(false)
  const [isEmailDuplicateLoading, setIsEmailDuplicateLoading] = useState(false)
  const [isEmailVerifiedLoading, setIsEmailVerifiedLoading] = useState(false)
  const [isSendEmailVerifiedCode, setIsSendEmailVerifiedCode] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getFieldState,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(signUpSchema),
    mode: "onChange",
    defaultValues: { isEmailVerified: false },
  })

  const email = watch("email")
  const isEmailVerified = watch("isEmailVerified")

  // 이메일을 바꾸면 인증을 다시 받아야 한다
  useEffect(() => {
    setValue("isEmailVerified", false)
    setIsSendEmailVerifiedCode(false)
  }, [email, setValue])

  const handleSignUp = async ({ email, password, nickname, name }: FormData) => {
    try {
      setIsPending(true)
      await signUp({ name, email, password, nickname })
      successToast("회원가입이 완료되었습니다. 로그인 해주세요.")
      router.replace("/auth/sign-in")
    } catch (error: any) {
      errorToast(getErrorMessage(error, "회원가입에 실패했습니다."))
    } finally {
      setIsPending(false)
    }
  }

  const isDuplicate = async () => {
    try {
      setIsEmailDuplicateLoading(true)
      const response: { existence: boolean } = await isDuplicateEmail(email)
      if (response.existence) {
        errorToast("이미 사용중인 이메일입니다.")
        return
      }
      await sendEmailVerificationCode(email)
      successToast("사용 가능한 이메일입니다. 이메일로 인증코드를 보냈습니다.")
      setIsSendEmailVerifiedCode(true)
    } catch (error: any) {
      errorToast(getErrorMessage(error, "인증코드 전송에 실패했습니다."))
    } finally {
      setIsEmailDuplicateLoading(false)
    }
  }

  const checkEmailVerifiedCode = async () => {
    try {
      setIsEmailVerifiedLoading(true)
      await checkEmailVerificationCode(email, watch("emailVerifiedCode"))
      successToast("이메일 인증이 완료되었습니다.")
      setValue("isEmailVerified", true, { shouldValidate: true })
    } catch (error: any) {
      setIsSendEmailVerifiedCode(false)
      errorToast(getErrorMessage(error, "이메일 인증에 실패했습니다."))
    } finally {
      setIsEmailVerifiedLoading(false)
    }
  }

  return (
    <FormScreen showLogo>
      <Stack.Screen options={{ title: "회원가입" }} />
      <ControlledField control={control} name="name" label="이름" placeholder="이름을 입력하세요." />
      <ControlledField
        control={control}
        name="nickname"
        label="닉네임"
        placeholder="닉네임을 입력하세요."
        autoCapitalize="none"
      />
      <ControlledField
        control={control}
        name="email"
        label="이메일"
        placeholder="이메일을 입력하세요."
        {...emailInputProps}
        right={
          <Button
            title="이메일 인증"
            size="sm"
            onPress={isDuplicate}
            loading={isEmailDuplicateLoading}
            disabled={!email || isSendEmailVerifiedCode || getFieldState("email").invalid}
          />
        }
      />
      {errors.isEmailVerified ? (
        <Text style={{ color: colors.error, fontSize: 12, fontWeight: "600", marginTop: -8 }}>
          {errors.isEmailVerified.message}
        </Text>
      ) : null}
      <ControlledField
        control={control}
        name="emailVerifiedCode"
        label="이메일 인증코드"
        placeholder="이메일 인증코드를 입력하세요."
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
        right={
          <Button
            title={isEmailVerified ? "인증 완료" : "인증번호 확인"}
            size="sm"
            onPress={checkEmailVerifiedCode}
            loading={isEmailVerifiedLoading}
            disabled={isEmailVerified || (watch("emailVerifiedCode") ?? "").length !== 6}
          />
        }
      />
      <ControlledField
        control={control}
        name="password"
        label="비밀번호"
        placeholder="비밀번호를 입력하세요."
        {...passwordInputProps}
        textContentType="newPassword"
      />
      <ControlledField
        control={control}
        name="rePassword"
        label="비밀번호 확인"
        placeholder="비밀번호를 입력하세요."
        {...passwordInputProps}
        textContentType="newPassword"
      />
      <Button title="회원가입" loading={isPending} onPress={() => handleSubmit(handleSignUp)()} style={{ marginTop: 8 }} />
    </FormScreen>
  )
}

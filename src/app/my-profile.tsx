import { useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack } from "expo-router"
import React, { useState } from "react"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"

import { getErrorMessage } from "@/components/auth/ControlledField"
import { FormScreen } from "@/components/auth/FormScreen"
import { PasswordFormData, PasswordSheet } from "@/components/profile/PasswordSheet"
import { PhoneSheet } from "@/components/profile/PhoneSheet"
import { ProfileForm, ProfileFormData } from "@/components/profile/ProfileForm"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { checkEmailVerificationCode, sendEmailVerificationCode } from "@/services/auth"
import { sendPhoneVerificationCode, verifyPhoneCode } from "@/services/system"
import { updateUser, updateUserPassword, updateUserPhone, withdrawUser } from "@/services/users"
import { SchoolType } from "@/types/lessons"

/** 웹 app/(private)/my-profile + components/profile/ProfileContainer */
export default function MyProfileScreen() {
  const canView = useSignInRedirect()
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const { signOut } = useAuth()

  const [isUpdateForm, setIsUpdateForm] = useState(false)
  const [isUpdateProfileLoading, setIsUpdateProfileLoading] = useState(false)
  const [isUpdatePhoneLoading, setIsUpdatePhoneLoading] = useState(false)
  const [isUpdatePasswordLoading, setIsUpdatePasswordLoading] = useState(false)
  const [isPhoneDialog, setIsPhoneDialog] = useState(false)
  const [isPasswordDialog, setIsPasswordDialog] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  /** 회원탈퇴 (앱 심사 지침 5.1.1(v)) — 두 번 확인 후 서버 탈퇴 → 로그아웃 */
  const confirmWithdraw = () => {
    Alert.alert(
      "회원탈퇴",
      "탈퇴하면 프로필·학력·연락처 등 개인정보가 삭제되고 되돌릴 수 없습니다.\n작성한 글과 댓글은 '탈퇴회원' 이름으로 남습니다.\n정말 탈퇴하시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: async () => {
            if (isWithdrawing) return
            setIsWithdrawing(true)
            try {
              await withdrawUser()
              await signOut()
              successToast("탈퇴가 완료되었습니다.")
              router.replace("/auth/sign-in")
            } catch (error: any) {
              errorToast(error?.message ?? "탈퇴에 실패했습니다. 잠시 후 다시 시도해주세요.")
            } finally {
              setIsWithdrawing(false)
            }
          },
        },
      ],
    )
  }

  const { data: user, isLoading } = useQuery({ ...queries.users.detail(), enabled: canView })

  const refreshUser = () => queryClient.invalidateQueries({ queryKey: queries.users.detail().queryKey })

  const updateProfile = async (payload: ProfileFormData) => {
    const { bachellor, master, doctor, birth, imageUrl, majors, nickname, name } = payload

    const schools: { type: SchoolType; name: string }[] = []
    if (bachellor) schools.push({ type: SchoolType.UNDERGRADUATE, name: bachellor })
    if (master) schools.push({ type: SchoolType.MASTER, name: master })
    if (doctor) schools.push({ type: SchoolType.DOCTOR, name: doctor })

    try {
      setIsUpdateProfileLoading(true)
      await updateUser({
        birth,
        iconImageUrl: imageUrl || undefined,
        majorIds: majors?.map((major: any) => major.id),
        name,
        schools: schools.length > 0 ? schools : undefined,
        // 웹과 동일하게 nickname 도 함께 보낸다 (UserPayload 타입에는 없음)
        ...({ nickname } as object),
      })
      successToast("프로필이 수정되었습니다.")
      await refreshUser()
      setIsUpdateForm(false)
    } catch (error: any) {
      errorToast(getErrorMessage(error, "프로필 수정에 실패했습니다."))
    } finally {
      setIsUpdateProfileLoading(false)
    }
  }

  const sendPhoneCode = async (phone: string) => {
    try {
      await sendPhoneVerificationCode(phone)
      successToast("인증번호가 발송되었습니다.")
    } catch (error: any) {
      errorToast(getErrorMessage(error, "인증번호 발송에 실패했습니다."))
    }
  }

  const checkPhoneCode = async (phone: string, verification: string) => {
    try {
      setIsUpdatePhoneLoading(true)
      await verifyPhoneCode({ phone, verification })
      await updateUserPhone(phone)
      await refreshUser()
      successToast("휴대폰 인증이 완료되었습니다.")
      setIsPhoneDialog(false)
    } catch (error: any) {
      errorToast(getErrorMessage(error, "휴대폰 인증에 실패했습니다."))
    } finally {
      setIsUpdatePhoneLoading(false)
    }
  }

  const handleUserPassword = async (payload: PasswordFormData) => {
    try {
      setIsUpdatePasswordLoading(true)
      await updateUserPassword(payload.password, user?.email as string)
      successToast("비밀번호 변경이 완료되었습니다.")
      setIsPasswordDialog(false)
    } catch (error: any) {
      errorToast(getErrorMessage(error, "비밀번호 변경에 실패했습니다."))
    } finally {
      setIsUpdatePasswordLoading(false)
    }
  }

  const sendEmailVerifyCode = async () => {
    try {
      await sendEmailVerificationCode(user?.email as string)
      successToast("인증코드가 전송되었습니다.")
    } catch (error) {
      errorToast("인증코드 전송에 실패했습니다.")
      throw error
    }
  }

  const checkEmailVerifyCode = async (verification: string) => {
    try {
      await checkEmailVerificationCode(user?.email as string, verification)
      successToast("이메일 인증이 완료되었습니다.")
    } catch (error: any) {
      if (error?.response?.data?.code === "VERIFICATION-001") {
        errorToast(error.response.data.message)
      } else {
        errorToast("이메일 인증에 실패했습니다.")
      }
      throw error
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "내 정보",
        }}
      />
      {!canView || isLoading ? (
        <Loading />
      ) : (
        <FormScreen contentStyle={{ paddingHorizontal: 24 }}>
          <View>
            <ProfileForm
              user={user}
              isUpdateForm={isUpdateForm}
              isUpdateProfileLoading={isUpdateProfileLoading}
              handleUpdateForm={() => setIsUpdateForm(prev => !prev)}
              handlePhoneDialog={() => setIsPhoneDialog(true)}
              handlePasswordDialog={() => setIsPasswordDialog(true)}
              handleProfile={updateProfile}
            />
            {!isUpdateForm ? (
              <Pressable onPress={confirmWithdraw} disabled={isWithdrawing} style={styles.withdraw} hitSlop={8}>
                <Text style={styles.withdrawText}>{isWithdrawing ? "탈퇴 처리 중…" : "회원탈퇴"}</Text>
              </Pressable>
            ) : null}
          </View>
        </FormScreen>
      )}
      <PhoneSheet
        visible={isPhoneDialog}
        onClose={() => setIsPhoneDialog(false)}
        sendCode={sendPhoneCode}
        checkCode={checkPhoneCode}
        isLoading={isUpdatePhoneLoading}
      />
      <PasswordSheet
        visible={isPasswordDialog}
        onClose={() => setIsPasswordDialog(false)}
        isLoading={isUpdatePasswordLoading}
        handlePassword={handleUserPassword}
        sendEmailVerifyCode={sendEmailVerifyCode}
        checkEmailVerifyCode={checkEmailVerifyCode}
      />
    </>
  )
}

const styles = StyleSheet.create({
  withdraw: { alignSelf: "center", marginTop: 40, paddingVertical: 8 },
  withdrawText: { fontSize: 13, color: colors.coolgray, textDecorationLine: "underline" },
})

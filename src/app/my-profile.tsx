import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { router, Stack } from "expo-router"
import React, { useState } from "react"
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { getErrorMessage } from "@/components/auth/ControlledField"
import { PasswordFormData, PasswordSheet } from "@/components/profile/PasswordSheet"
import { PhoneSheet } from "@/components/profile/PhoneSheet"
import { ProfileHeader } from "@/components/profile/ProfileHeader"
import { ProfileEditForm, ProfileFormData } from "@/components/profile/ProfileEditForm"
import { SettingsGroup, SettingsRow } from "@/components/profile/SettingsGroup"
import { useSignInRedirect } from "@/components/profile/useSignInRedirect"
import { LegalLinks } from "@/components/auth/LegalLinks"
import { Loading } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { useAuth } from "@/lib/auth"
import { syncPushToken, usePushStatus } from "@/lib/push"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"
import { checkEmailVerificationCode, sendEmailVerificationCode } from "@/services/auth"
import { PushPreferences, updatePushPreferences } from "@/services/push"
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
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [isUpdateProfileLoading, setIsUpdateProfileLoading] = useState(false)
  const [isUpdatePhoneLoading, setIsUpdatePhoneLoading] = useState(false)
  const [isUpdatePasswordLoading, setIsUpdatePasswordLoading] = useState(false)
  const [isPhoneDialog, setIsPhoneDialog] = useState(false)
  const [isPasswordDialog, setIsPasswordDialog] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const pushStatus = usePushStatus()
  const filter = filters()

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

  /** 수정 취소 — 고친 게 있으면 한 번 확인한다 */
  const cancelEdit = () => {
    if (!isFormDirty) {
      setIsUpdateForm(false)
      return
    }
    Alert.alert("수정을 취소할까요?", "바꾼 내용이 저장되지 않습니다.", [
      { text: "계속 수정", style: "cancel" },
      { text: "취소", style: "destructive", onPress: () => setIsUpdateForm(false) },
    ])
  }

  const confirmSignOut = () => {
    Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          await signOut()
          router.replace("/")
        },
      },
    ])
  }

  const { data: user, isLoading } = useQuery({
    ...queries.users.detail(),
    enabled: canView,
  })
  const { data: pushPreferences } = useQuery({
    ...queries.push.preferences(),
    enabled: canView,
  })

  /** 알림 스위치 — 서버 설정을 바꾸고(낙관적 반영), 켤 때는 기기 권한도 확인해 꺼져 있으면 설정 앱으로 안내 */
  const pushMutation = useMutation({
    mutationFn: (patch: Partial<PushPreferences>) => updatePushPreferences(patch),
    onMutate: async patch => {
      const key = queries.push.preferences().queryKey
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<PushPreferences>(key)
      queryClient.setQueryData<PushPreferences>(key, current => ({
        ...(current ?? { job: true }),
        ...patch,
      }))
      return { previous }
    },
    onError: (_error, _patch, context) => {
      queryClient.setQueryData(queries.push.preferences().queryKey, context?.previous)
      errorToast("알림 설정 저장에 실패했습니다.")
    },
    onSuccess: data => queryClient.setQueryData(queries.push.preferences().queryKey, data),
  })

  const toggleJobPush = async (enabled: boolean) => {
    pushMutation.mutate({ job: enabled })
    if (!enabled) return
    const status = await syncPushToken()
    if (status === "denied") {
      Alert.alert("알림이 꺼져 있어요", "기기 설정에서 아트인포 알림을 허용해야 푸시를 받을 수 있습니다.", [
        { text: "나중에", style: "cancel" },
        { text: "설정 열기", onPress: () => Linking.openSettings() },
      ])
    }
  }

  const pushFooter =
    pushStatus === "denied"
      ? "기기 설정에서 알림이 꺼져 있어 푸시를 받을 수 없습니다. 설정 앱에서 아트인포 알림을 허용해 주세요."
      : pushStatus === "unavailable"
        ? "이 기기에서는 푸시 알림을 받을 수 없습니다."
        : "새 채용 공고가 올라오면 푸시로 알려드려요."

  const refreshUser = () =>
    queryClient.invalidateQueries({
      queryKey: queries.users.detail().queryKey,
    })

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

  const schoolLabels: { type: SchoolType; label: string }[] = [
    { type: SchoolType.UNDERGRADUATE, label: "학사" },
    { type: SchoolType.MASTER, label: "석사" },
    { type: SchoolType.DOCTOR, label: "박사" },
  ]
  const schoolRows = schoolLabels
    .map(({ type, label }) => ({
      type,
      label,
      name: user?.schools?.find(school => school.type === type)?.name,
    }))
    .filter((school): school is { type: SchoolType; label: string; name: string } => !!school.name)

  return (
    <>
      <Stack.Screen
        options={{
          title: isUpdateForm ? "프로필 수정" : "내 정보",
          headerBackVisible: !isUpdateForm,
          gestureEnabled: !isUpdateForm,
          headerLeft: isUpdateForm
            ? () => (
                <Pressable onPress={cancelEdit} hitSlop={8}>
                  <Text style={styles.headerCancel}>취소</Text>
                </Pressable>
              )
            : undefined,
        }}
      />
      {!canView || isLoading ? (
        <Loading />
      ) : isUpdateForm ? (
        <ProfileEditForm
          user={user}
          isSubmitting={isUpdateProfileLoading}
          onSubmit={updateProfile}
          onDirtyChange={setIsFormDirty}
        />
      ) : (
        <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
          <ProfileHeader user={user} onEdit={() => setIsUpdateForm(true)} />

          <SettingsGroup title="기본 정보">
            <SettingsRow icon="envelope" label="이메일" value={user?.email} />
            <SettingsRow
              icon="phone"
              label="휴대폰"
              value={user?.phone}
              placeholder="등록하기"
              onPress={() => setIsPhoneDialog(true)}
            />
            <SettingsRow
              icon="calendar"
              label="생년월일"
              value={filter.YYYYMMDD(user?.birth, "YYYY-MM-DD")}
              placeholder="등록하기"
              onPress={() => setIsUpdateForm(true)}
            />
          </SettingsGroup>

          <SettingsGroup title="학력">
            {schoolRows.length ? (
              schoolRows.map(school => (
                <SettingsRow key={school.type} icon="graduationcap" label={school.label} value={school.name} />
              ))
            ) : (
              <SettingsRow
                icon="graduationcap"
                label="학력"
                placeholder="등록하기"
                onPress={() => setIsUpdateForm(true)}
              />
            )}
          </SettingsGroup>

          <SettingsGroup title="알림" footer={pushFooter}>
            <SettingsRow
              icon="bell.badge"
              iconColor={colors.main}
              label="채용 공고 알림"
              switchValue={pushPreferences?.job ?? true}
              onToggle={toggleJobPush}
            />
          </SettingsGroup>

          <SettingsGroup title="계정">
            <SettingsRow icon="lock" label="비밀번호 변경" onPress={() => setIsPasswordDialog(true)} />
            <SettingsRow icon="rectangle.portrait.and.arrow.right" label="로그아웃" onPress={confirmSignOut} />
            <SettingsRow
              icon="person.crop.circle.badge.minus"
              iconColor={colors.error}
              label={isWithdrawing ? "탈퇴 처리 중…" : "회원탈퇴"}
              destructive
              onPress={confirmWithdraw}
              disabled={isWithdrawing}
            />
          </SettingsGroup>

          <View style={{ marginTop: 8 }}>
            <LegalLinks />
          </View>
        </ScrollView>
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
  screen: { flex: 1, backgroundColor: colors.surface2 },
  content: { padding: 16, paddingBottom: 48, gap: 24 },
  headerCancel: { fontSize: 16, color: colors.ink2 },
})

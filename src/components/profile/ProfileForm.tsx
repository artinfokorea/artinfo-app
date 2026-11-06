import { yupResolver } from "@hookform/resolvers/yup"
import { Image } from "expo-image"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native"
import * as yup from "yup"

import { ControlledField } from "@/components/auth/ControlledField"
import { MajorSheet } from "@/components/profile/MajorSheet"
import { DateField } from "@/components/ui/DateField"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { pickAndUploadImage } from "@/components/ui/ImagePickerField"
import { Button } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { profileSchema } from "@/lib/schemas"
import { UploadTarget } from "@/types"
import { SchoolType, SchoolTypeValues } from "@/types/lessons"
import { MAJOR } from "@/types/majors"
import { USER } from "@/types/users"

export type ProfileFormData = yup.InferType<typeof profileSchema>

type Props = {
  user?: USER
  isUpdateForm: boolean
  isUpdateProfileLoading: boolean
  handleUpdateForm: () => void
  handlePhoneDialog: () => void
  handlePasswordDialog: () => void
  handleProfile: (payload: ProfileFormData) => void
}

const icons = {
  user: require("@/assets/images/icon-user-profile.png"),
  email: require("@/assets/images/icon-email.png"),
  phone: require("@/assets/images/icon-phone.png"),
  bachelor: require("@/assets/images/icon-bachelor.png"),
  master: require("@/assets/images/icon-master.png"),
  doctor: require("@/assets/images/icon-doctor.png"),
}

const schoolName = (user: USER | undefined, type: SchoolType) =>
  user?.schools?.find(school => school.type === type)?.name

/** 웹 components/profile/ProfileForm (모바일 레이아웃) */
export const ProfileForm = ({
  user,
  isUpdateForm,
  isUpdateProfileLoading,
  handleUpdateForm,
  handlePhoneDialog,
  handlePasswordDialog,
  handleProfile,
}: Props) => {
  const filter = filters()
  const { successToast, errorToast } = useToast()
  const [isMajorDialog, setIsMajorDialog] = useState(false)
  const [isUploadLoading, setIsUploadLoading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: yupResolver(profileSchema),
  })

  const resetFromUser = React.useCallback(() => {
    if (!user) return
    reset({
      birth: filter.YYYYMMDD(user.birth, "YYYY-MM-DD") ?? "",
      majors: user.majors ?? [],
      bachellor: schoolName(user, SchoolType.UNDERGRADUATE) ?? "",
      master: schoolName(user, SchoolType.MASTER) ?? "",
      doctor: schoolName(user, SchoolType.DOCTOR) ?? "",
      imageUrl: user.iconImageUrl ?? "",
      nickname: user.nickname ?? "",
      name: user.name ?? "",
      phone: user.phone ?? "",
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, reset])

  useEffect(() => {
    resetFromUser()
  }, [resetFromUser])

  const majors = (watch("majors") ?? []) as MAJOR[]
  const imageUrl = watch("imageUrl")
  const phone = watch("phone")

  const handleSelectMajor = (selected: MAJOR) => {
    if (majors.some(major => major.id === selected.id)) {
      setValue(
        "majors",
        majors.filter(major => major.id !== selected.id),
        { shouldDirty: true, shouldValidate: true },
      )
    } else {
      setValue("majors", [...majors, selected], { shouldDirty: true, shouldValidate: true })
    }
  }

  const uploadAvatar = async () => {
    try {
      setIsUploadLoading(true)
      const url = await pickAndUploadImage(UploadTarget.USER, { aspect: [1, 1] })
      if (url) {
        setValue("imageUrl", url, { shouldDirty: true, shouldTouch: true })
        successToast("새 이미지가 등록되었습니다. 확인을 눌러주세요.")
      }
    } catch (error: any) {
      errorToast(error?.message ?? "이미지 업로드에 실패했습니다.")
    } finally {
      setIsUploadLoading(false)
    }
  }

  const cancel = () => {
    resetFromUser()
    handleUpdateForm()
  }

  const schools: { key: "bachellor" | "master" | "doctor"; icon: any; label: string; type: string; placeholder: string }[] = [
    { key: "bachellor", icon: icons.bachelor, label: "학사", type: SchoolTypeValues.UNDERGRADUATE, placeholder: "대학교 명을 입력해주세요." },
    { key: "master", icon: icons.master, label: "석사", type: SchoolTypeValues.MASTER, placeholder: "대학원 명을 입력해주세요." },
    { key: "doctor", icon: icons.doctor, label: "박사", type: SchoolTypeValues.DOCTOR, placeholder: "대학원 명을 입력해주세요." },
  ]

  return (
    <View style={{ gap: 20 }}>
      {/* 프로필 이미지 */}
      <View style={styles.avatarWrap}>
        {isUploadLoading ? (
          <View style={[styles.avatar, { alignItems: "center", justifyContent: "center" }]}>
            <ActivityIndicator color={colors.main} />
          </View>
        ) : (
          <FallbackImage src={imageUrl || undefined} style={styles.avatar} />
        )}
        {isUpdateForm && imageUrl ? (
          <Pressable
            style={styles.avatarRemove}
            onPress={() => setValue("imageUrl", "", { shouldDirty: true })}
            accessibilityLabel="프로필 이미지 삭제"
          >
            <Icon name="xmark" size={18} color={colors.black} />
          </Pressable>
        ) : null}
        {isUpdateForm ? (
          <Pressable
            style={styles.avatarCamera}
            onPress={uploadAvatar}
            disabled={isUploadLoading}
            accessibilityLabel="프로필 이미지 변경"
          >
            <Icon name="camera.fill" size={20} color={colors.white} />
          </Pressable>
        ) : null}
      </View>

      {/* 이름 */}
      {isUpdateForm ? (
        <ControlledField
          control={control}
          name="name"
          placeholder="이름을 입력해주세요."
          containerStyle={{ alignSelf: "center", width: 200 }}
          style={{ textAlign: "center" }}
        />
      ) : (
        <Text style={styles.name}>{user?.name}</Text>
      )}

      {/* 버튼 */}
      <View style={styles.buttonRow}>
        {isUpdateForm ? (
          <>
            <Button title="취소" variant="muted" size="sm" style={styles.roundButton} onPress={cancel} />
            <Button
              title="확인"
              size="sm"
              style={styles.roundButton}
              loading={isUpdateProfileLoading}
              disabled={!isDirty}
              onPress={() => handleSubmit(handleProfile)()}
            />
          </>
        ) : (
          <>
            <Button
              title="비밀번호 변경"
              variant="muted"
              size="sm"
              style={styles.roundButton}
              onPress={handlePasswordDialog}
            />
            <Button title="내정보 수정" size="sm" style={styles.roundButton} onPress={handleUpdateForm} />
          </>
        )}
      </View>

      {/* 기본 정보 */}
      <View style={{ gap: 14 }}>
        <View style={styles.infoRow}>
          <Image source={icons.user} style={styles.infoIcon} />
          {isUpdateForm ? (
            <ControlledField
              control={control}
              name="nickname"
              placeholder="닉네임을 입력해주세요."
              autoCapitalize="none"
              containerStyle={{ flex: 1 }}
            />
          ) : (
            <Text style={styles.infoText}>{user?.nickname}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Image source={icons.email} style={styles.infoIcon} />
          <Text style={styles.infoText}>{user?.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="calendar" size={22} color={colors.gray800} style={{ marginHorizontal: 1 }} />
          {isUpdateForm ? (
            <Controller
              control={control}
              name="birth"
              render={({ field, fieldState }) => (
                <DateField
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  placeholder="1945-08-15"
                  maximumDate={new Date()}
                  error={fieldState.error?.message}
                  containerStyle={{ flex: 1 }}
                />
              )}
            />
          ) : (
            <Text style={styles.infoText}>{filter.YYYYMMDD(user?.birth, "YYYY-MM-DD")}</Text>
          )}
        </View>
        <View style={styles.infoRow}>
          <Image source={icons.phone} style={styles.infoIcon} />
          {phone ? (
            <Text style={styles.infoText}>{phone}</Text>
          ) : (
            <Button title="휴대폰 번호 등록" variant="outline" size="sm" onPress={handlePhoneDialog} />
          )}
        </View>
      </View>

      {/* 전공 */}
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={styles.sectionTitle}>전공</Text>
          {isUpdateForm ? (
            <Button title="전공 등록" variant="outline" size="sm" onPress={() => setIsMajorDialog(true)} />
          ) : null}
        </View>
        <View style={styles.badges}>
          {majors.map(major => (
            <View key={major.id} style={styles.majorBadge}>
              <Text style={styles.majorBadgeText}>{major.koName}</Text>
              {isUpdateForm ? (
                <Pressable onPress={() => handleSelectMajor(major)} hitSlop={6}>
                  <Icon name="xmark" size={10} color={colors.white} weight="bold" />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
        {errors.majors ? <Text style={styles.error}>{errors.majors.message}</Text> : null}
      </View>

      {/* 학력 */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>학력</Text>
        {schools.map(school =>
          isUpdateForm ? (
            <View key={school.key} style={styles.infoRow}>
              <Image source={school.icon} style={styles.schoolIcon} />
              <Text style={{ fontSize: 14, color: colors.gray800 }}>{school.label}</Text>
              <ControlledField
                control={control}
                name={school.key}
                placeholder={school.placeholder}
                containerStyle={{ flex: 1 }}
              />
            </View>
          ) : watch(school.key) ? (
            <View key={school.key} style={[styles.infoRow, { gap: 24 }]}>
              <Image source={school.icon} style={styles.schoolIcon} />
              <View>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.primary }}>
                  {watch(school.key)}
                </Text>
                <Text style={{ fontSize: 14, color: colors.coolgray }}>{school.type}</Text>
              </View>
            </View>
          ) : null,
        )}
      </View>

      <MajorSheet
        visible={isMajorDialog}
        onClose={() => setIsMajorDialog(false)}
        selectedMajors={majors}
        onSelectMajor={handleSelectMajor}
        multiple
      />
    </View>
  )
}

const styles = StyleSheet.create({
  avatarWrap: { alignSelf: "center", width: 150, height: 150 },
  avatar: { width: 150, height: 150, borderRadius: 75, backgroundColor: colors.gray100 },
  avatarRemove: {
    position: "absolute",
    right: 0,
    top: 0,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 18,
    padding: 8,
  },
  avatarCamera: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#3b82f6",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.white,
    padding: 7,
  },
  name: { textAlign: "center", fontSize: 20, fontWeight: "700", color: colors.black },
  buttonRow: { flexDirection: "row", justifyContent: "center", gap: 12 },
  roundButton: { borderRadius: 999, minWidth: 80 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  infoIcon: { width: 24, height: 24 },
  schoolIcon: { width: 28, height: 28 },
  infoText: { fontSize: 16, fontWeight: "500", color: colors.gray900, flexShrink: 1 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.black },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  majorBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.main,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  majorBadgeText: { color: colors.white, fontSize: 12, fontWeight: "600" },
  error: { color: colors.error, fontWeight: "600", fontSize: 13 },
})

import { yupResolver } from "@hookform/resolvers/yup"
import React, { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import * as yup from "yup"

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
import { SchoolType } from "@/types/lessons"
import { MAJOR } from "@/types/majors"
import { USER } from "@/types/users"

export type ProfileFormData = yup.InferType<typeof profileSchema>

type Props = {
  user?: USER
  isSubmitting: boolean
  onSubmit: (payload: ProfileFormData) => void
  /** 폼이 수정됐는지 바깥(취소 확인)에 알린다 */
  onDirtyChange?: (dirty: boolean) => void
}

const schoolName = (user: USER | undefined, type: SchoolType) => user?.schools?.find(school => school.type === type)?.name

const SCHOOLS: { key: "bachellor" | "master" | "doctor"; label: string; placeholder: string }[] = [
  { key: "bachellor", label: "학사", placeholder: "대학교" },
  { key: "master", label: "석사", placeholder: "대학원" },
  { key: "doctor", label: "박사", placeholder: "대학원" },
]

/** 라벨 왼쪽 + 입력 오른쪽으로 된 한 줄 편집 행 */
const EditRow = ({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) => (
  <View style={styles.row}>
    <View style={styles.rowLine}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowField}>{children}</View>
    </View>
    {error ? <Text style={styles.error}>{error}</Text> : null}
  </View>
)

/**
 * 프로필 수정 — 조회 화면과 같은 카드 구조에서 바로 고친다.
 * 사진·이름·닉네임은 상단 카드, 생년월일·전공·학력은 아래 그룹, 저장은 하단 고정 버튼 하나.
 */
export const ProfileEditForm = ({ user, isSubmitting, onSubmit, onDirtyChange }: Props) => {
  const filter = filters()
  const insets = useSafeAreaInsets()
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
  } = useForm<ProfileFormData>({ resolver: yupResolver(profileSchema) })

  useEffect(() => {
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
    onDirtyChange?.(isDirty)
  }, [isDirty, onDirtyChange])

  const majors = (watch("majors") ?? []) as MAJOR[]
  const imageUrl = watch("imageUrl")

  const toggleMajor = (selected: MAJOR) => {
    const next = majors.some(major => major.id === selected.id)
      ? majors.filter(major => major.id !== selected.id)
      : [...majors, selected]
    setValue("majors", next, { shouldDirty: true, shouldValidate: true })
  }

  const changeAvatar = async () => {
    try {
      setIsUploadLoading(true)
      const url = await pickAndUploadImage(UploadTarget.USER, { aspect: [1, 1] })
      if (url) {
        setValue("imageUrl", url, { shouldDirty: true })
        successToast("새 사진을 올렸습니다. 저장을 눌러주세요.")
      }
    } catch (error: any) {
      errorToast(error?.message ?? "이미지 업로드에 실패했습니다.")
    } finally {
      setIsUploadLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={100}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {/* 사진·이름·닉네임 */}
        <View style={styles.card}>
          <View style={styles.avatarRow}>
            <Pressable onPress={changeAvatar} disabled={isUploadLoading} style={styles.avatarWrap} accessibilityLabel="프로필 사진 변경">
              {isUploadLoading ? (
                <View style={[styles.avatar, styles.center]}>
                  <ActivityIndicator color={colors.main} />
                </View>
              ) : (
                <FallbackImage src={imageUrl || undefined} style={styles.avatar} />
              )}
              <View style={styles.avatarBadge}>
                <Icon name="camera.fill" size={12} color={colors.white} />
              </View>
            </Pressable>
            <View style={{ flex: 1, gap: 6 }}>
              <Pressable onPress={changeAvatar} disabled={isUploadLoading} hitSlop={6}>
                <Text style={styles.avatarAction}>사진 바꾸기</Text>
              </Pressable>
              {imageUrl ? (
                <Pressable onPress={() => setValue("imageUrl", "", { shouldDirty: true })} hitSlop={6}>
                  <Text style={[styles.avatarAction, { color: colors.muted }]}>사진 지우기</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
          <View style={styles.divider} />
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <EditRow label="이름" error={fieldState.error?.message}>
                <TextInput
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="이름"
                  placeholderTextColor={colors.gray400}
                  style={styles.input}
                />
              </EditRow>
            )}
          />
          <View style={styles.divider} />
          <Controller
            control={control}
            name="nickname"
            render={({ field, fieldState }) => (
              <EditRow label="닉네임" error={fieldState.error?.message}>
                <TextInput
                  value={field.value ?? ""}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="닉네임"
                  placeholderTextColor={colors.gray400}
                  autoCapitalize="none"
                  style={styles.input}
                />
              </EditRow>
            )}
          />
        </View>

        {/* 생년월일·전공 */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>기본 정보</Text>
          <View style={styles.card}>
            <Controller
              control={control}
              name="birth"
              render={({ field, fieldState }) => (
                <EditRow label="생년월일" error={fieldState.error?.message}>
                  <DateField
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="1990-01-01"
                    maximumDate={new Date()}
                    compact
                    containerStyle={{ flex: 1 }}
                  />
                </EditRow>
              )}
            />
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.rowLine}>
                <Text style={styles.rowLabel}>전공</Text>
                <Pressable onPress={() => setIsMajorDialog(true)} style={styles.addButton} hitSlop={6}>
                  <Icon name="plus" size={11} color={colors.main} weight="bold" />
                  <Text style={styles.addButtonText}>{majors.length ? "바꾸기" : "전공 선택"}</Text>
                </Pressable>
              </View>
              {majors.length ? (
                <View style={styles.badges}>
                  {majors.map(major => (
                    <Pressable key={major.id} onPress={() => toggleMajor(major)} style={styles.badge} hitSlop={4}>
                      <Text style={styles.badgeText}>{major.koName}</Text>
                      <Icon name="xmark" size={9} color={colors.tagText} weight="bold" />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {errors.majors ? <Text style={styles.error}>{errors.majors.message}</Text> : null}
            </View>
          </View>
          <Text style={styles.groupFooter}>전공은 2개까지 고를 수 있어요. 뱃지를 누르면 빠집니다.</Text>
        </View>

        {/* 학력 */}
        <View style={styles.group}>
          <Text style={styles.groupTitle}>학력</Text>
          <View style={styles.card}>
            {SCHOOLS.map((school, index) => (
              <React.Fragment key={school.key}>
                {index > 0 ? <View style={styles.divider} /> : null}
                <Controller
                  control={control}
                  name={school.key}
                  render={({ field }) => (
                    <EditRow label={school.label}>
                      <TextInput
                        value={field.value ?? ""}
                        onChangeText={field.onChange}
                        onBlur={field.onBlur}
                        placeholder={school.placeholder}
                        placeholderTextColor={colors.gray400}
                        style={styles.input}
                      />
                    </EditRow>
                  )}
                />
              </React.Fragment>
            ))}
          </View>
          <Text style={styles.groupFooter}>해당 없는 칸은 비워 두면 됩니다.</Text>
        </View>
      </ScrollView>

      {/* 하단 고정 저장 */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          title="저장"
          size="lg"
          loading={isSubmitting}
          disabled={!isDirty || isUploadLoading}
          onPress={() => handleSubmit(onSubmit)()}
        />
      </View>

      <MajorSheet
        visible={isMajorDialog}
        onClose={() => setIsMajorDialog(false)}
        selectedMajors={majors}
        onSelectMajor={toggleMajor}
        multiple
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface2 },
  content: { padding: 16, paddingBottom: 32, gap: 24 },
  group: { gap: 8 },
  groupTitle: { fontSize: 13, fontWeight: "600", color: colors.muted, paddingHorizontal: 4 },
  groupFooter: { fontSize: 12, color: colors.muted, paddingHorizontal: 4, lineHeight: 17 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: "hidden",
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginLeft: 16 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: 16, padding: 16 },
  avatarWrap: { width: 64, height: 64 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.main,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarAction: { fontSize: 14, fontWeight: "600", color: colors.main },
  row: { paddingHorizontal: 16, paddingVertical: 10, gap: 10, minHeight: 52, justifyContent: "center" },
  rowLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowLabel: { width: 72, fontSize: 15, fontWeight: "500", color: colors.ink },
  rowField: { flex: 1 },
  input: { flex: 1, fontSize: 16, color: colors.ink, paddingVertical: 6, textAlign: "right" },
  addButton: { marginLeft: "auto", flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 },
  addButtonText: { fontSize: 14, fontWeight: "600", color: colors.main },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.tagBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: colors.tagText },
  error: { fontSize: 12, color: colors.error, fontWeight: "500" },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
})

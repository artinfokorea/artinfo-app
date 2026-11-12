import { yupResolver } from "@hookform/resolvers/yup"
import React, { useRef, useState } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { AddressField, FieldError } from "@/components/jobs/FormFields"
import { MajorChipPicker } from "@/components/jobs/MajorChipPicker"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { pickAndUploadImage } from "@/components/ui/ImagePickerField"
import { Button, TextField } from "@/components/ui/primitives"
import { RichEditor } from "@/components/ui/RichEditor"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { jobSchema } from "@/lib/schemas"
import { UploadTarget } from "@/types"
import { JOB, JobType, JobTypeList } from "@/types/jobs"
import { MAJOR } from "@/types/majors"

export type FullTimeJobFormData = {
  title: string
  companyName: string
  recruitSiteUrl?: string | null
  address: string
  addressDetail: string
  imageUrl?: string | null
  contents: string
  majors: MAJOR[]
}

type Props = {
  onSubmit: (data: FullTimeJobFormData, type: JobType) => void
  isLoading: boolean
  job?: JOB
  /** 등록 화면의 처음 분류 (링크로 넘어온 jobType). 수정 화면은 job.type 으로 잠긴다 */
  initialType?: JobType
}

/** 등록 전 남은 필수 항목 — 하단 바에 개수를 보여 준다 (yup 스키마의 필수 항목과 같다) */
const REQUIRED: (keyof FullTimeJobFormData)[] = ["title", "companyName", "majors", "address", "addressDetail", "contents"]
const TYPES = JobTypeList.filter(item => item.value !== JobType.AMATEUR && item.value !== JobType.YOUTH)

/**
 * 채용 등록·수정 (예술단체·종교·대학/학원 공통) — 웹 components/jobs/FullTimeJobForm 과 같은 구성.
 * 분류는 맨 위 세그먼트, 종교는 대표 이미지 없이. 연주 대타는 PartTimeForm.
 */
export const FullTimeJobForm = ({ onSubmit, isLoading, job, initialType }: Props) => {
  const insets = useSafeAreaInsets()
  const { successToast, errorToast } = useToast()
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null)
  const [type, setType] = useState<JobType>(job?.type ?? initialType ?? JobType.ART_ORGANIZATION)
  const [uploading, setUploading] = useState(false)
  const withImage = type !== JobType.RELIGION

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<FullTimeJobFormData>({
    resolver: yupResolver(jobSchema) as any,
    defaultValues: {
      majors: job?.majors?.majors || [],
      title: job?.title || "",
      companyName: job?.companyName || "",
      addressDetail: job?.addressDetail || "",
      contents: job?.contents || "",
      address: job?.address || "",
      imageUrl: job?.imageUrl || "",
      recruitSiteUrl: job?.recruitSiteUrl || "",
    },
  })
  const values = watch()
  const majors = values.majors ?? []
  const remaining = REQUIRED.filter(key => {
    const value = values[key]
    return Array.isArray(value) ? value.length === 0 : !String(value ?? "").trim()
  }).length

  const toggleMajor = (major: MAJOR) => {
    const next = majors.some(m => m.id === major.id) ? majors.filter(m => m.id !== major.id) : [...majors, major]
    setValue("majors", next, { shouldValidate: next.length > 0 })
    if (next.length > 0) clearErrors("majors")
  }

  const pickImage = async () => {
    try {
      setUploading(true)
      const url = await pickAndUploadImage(UploadTarget.JOB, {})
      if (url) {
        setValue("imageUrl", url)
        successToast("대표 이미지를 올렸습니다.")
      }
    } catch {
      errorToast("이미지 업로드에 실패했습니다.")
    } finally {
      setUploading(false)
    }
  }

  /** 등록을 눌렀는데 틀린 칸이 있으면 — 맨 위로 올리고 첫 오류를 토스트로 */
  const onInvalid = (invalid: FieldErrors<FullTimeJobFormData>) => {
    const firstMessage = Object.values(invalid).find(e => e?.message)?.message as string | undefined
    scrollRef.current?.scrollTo({ y: 0, animated: true })
    errorToast(firstMessage ?? "입력을 확인해 주세요.")
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.lead}>
          등록하면 바로 게시됩니다. <Text style={{ color: colors.error }}>*</Text> 표시는 필수 항목입니다.
        </Text>

        {/* 분류 — 수정 중에는 바꿀 수 없다 */}
        <View style={styles.seg} accessibilityRole="tablist">
          {TYPES.map(item => {
            const on = item.value === type
            const locked = !!job && !on
            return (
              <Pressable
                key={item.value}
                onPress={() => setType(item.value)}
                disabled={locked}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                style={[styles.segItem, on && styles.segItemOn, locked && { opacity: 0.4 }]}
              >
                <Text style={[styles.segText, on && styles.segTextOn]}>{item.title}</Text>
              </Pressable>
            )
          })}
        </View>

        {withImage ? (
          <Section title="대표 이미지" optional>
            <View style={styles.imageRow}>
              <Pressable onPress={pickImage} disabled={uploading} accessibilityRole="button" accessibilityLabel={values.imageUrl ? "대표 이미지 바꾸기" : "대표 이미지 올리기"} style={styles.imageBox}>
                {values.imageUrl ? (
                  <FallbackImage src={values.imageUrl} style={StyleSheet.absoluteFill} contentFit="cover" />
                ) : (
                  <View style={{ alignItems: "center", gap: 4 }}>
                    <Icon name="photo" size={22} color={colors.coolgray} />
                    <Text style={styles.imageBoxText}>이미지 선택</Text>
                  </View>
                )}
                {uploading ? (
                  <View style={[StyleSheet.absoluteFill, styles.overlay]}>
                    <ActivityIndicator color="#fff" />
                  </View>
                ) : null}
              </Pressable>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.imageTitle}>이미지가 있는 공고가 더 많이 열립니다</Text>
                <Text style={styles.imageDesc}>포스터·로고 모두 괜찮아요</Text>
                {values.imageUrl ? (
                  <Pressable onPress={() => setValue("imageUrl", "")} hitSlop={6}>
                    <Text style={styles.imageRemove}>이미지 지우기</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </Section>
        ) : null}

        <Section title="기본 정보">
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                label="제목"
                required
                value={field.value}
                onChangeText={field.onChange}
                maxLength={50}
                placeholder="예) 2026 시즌 제2바이올린 단원 모집"
                error={errors.title?.message}
                right={<Text style={styles.count}>{(field.value ?? "").length}/50</Text>}
                containerStyle={{ marginBottom: 14 }}
              />
            )}
          />
          <Controller
            control={control}
            name="companyName"
            render={({ field }) => (
              <TextField label="단체명" required value={field.value} onChangeText={field.onChange} maxLength={20} placeholder="예) 서울시립교향악단" error={errors.companyName?.message} containerStyle={{ marginBottom: 14 }} />
            )}
          />
          <Text style={styles.label}>
            모집 전공 <Text style={{ color: colors.error }}>*</Text> <Text style={styles.hint}>여러 개 선택</Text>
          </Text>
          <MajorChipPicker selected={majors} onToggle={toggleMajor} />
          <FieldError message={errors.majors?.message as string | undefined} />
        </Section>

        <Section title="근무지">
          <Text style={styles.label}>
            주소 <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <Controller
            control={control}
            name="address"
            render={({ field }) => <AddressField value={field.value} onChange={field.onChange} placeholder="주소 검색" error={errors.address?.message} />}
          />
          <Controller
            control={control}
            name="addressDetail"
            render={({ field }) => (
              <TextField label="상세 주소" required value={field.value} onChangeText={field.onChange} placeholder="예) 3층 연습실" error={errors.addressDetail?.message} containerStyle={{ marginTop: 6 }} />
            )}
          />
        </Section>

        <Section title="접수" optional>
          <Text style={styles.desc}>링크가 있으면 상세 화면에 지원하기 버튼이 생깁니다. 없으면 공고 내용의 안내를 따릅니다.</Text>
          <Controller
            control={control}
            name="recruitSiteUrl"
            render={({ field }) => (
              <TextField label="접수 사이트 링크" value={field.value ?? ""} onChangeText={field.onChange} placeholder="https://" autoCapitalize="none" keyboardType="url" error={errors.recruitSiteUrl?.message} />
            )}
          />
        </Section>

        <Section title="공고 내용">
          <Text style={styles.label}>
            모집 분야, 자격, 전형 일정, 접수 방법, 문의처 <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <RichEditor initialHtml={job?.contents ?? ""} onChange={html => setValue("contents", html, { shouldValidate: !!errors.contents })} uploadTarget={UploadTarget.JOB} />
          <FieldError message={errors.contents?.message} />
        </Section>
      </ScrollView>

      {/* 하단 고정 바 — 남은 필수 항목 수 + 등록 */}
      <View style={[styles.dock, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <View style={styles.status}>
          <View style={[styles.dot, { backgroundColor: remaining ? colors.error : colors.green }]} />
          {remaining ? (
            <Text style={styles.statusText}>
              필수 항목 <Text style={{ color: colors.error, fontWeight: "700" }}>{remaining}개</Text> 남음
            </Text>
          ) : (
            <Text style={[styles.statusText, { color: colors.green, fontWeight: "700" }]}>등록할 수 있어요</Text>
          )}
        </View>
        <Button title={job ? "수정하기" : "등록하기"} loading={isLoading} disabled={uploading} onPress={() => void handleSubmit(data => onSubmit(data, type), onInvalid)()} />
      </View>
    </KeyboardAvoidingView>
  )
}

const Section = ({ title, optional, children }: { title: string; optional?: boolean; children: React.ReactNode }) => (
  <View style={styles.section}>
    <View style={styles.sectionHead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {optional ? <Text style={styles.optional}>선택</Text> : null}
    </View>
    {children}
  </View>
)

const styles = StyleSheet.create({
  lead: { fontSize: 12, color: colors.coolgray, marginBottom: 12 },
  seg: { flexDirection: "row", gap: 4, backgroundColor: colors.surface2, borderRadius: 14, padding: 4 },
  segItem: { flex: 1, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  segItemOn: { backgroundColor: colors.white, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segText: { fontSize: 14, fontWeight: "600", color: colors.muted },
  segTextOn: { color: colors.ink, fontWeight: "700" },
  section: { marginTop: 26 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "800", color: colors.ink },
  optional: { fontSize: 11, fontWeight: "600", color: colors.coolgray, backgroundColor: colors.surface2, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, overflow: "hidden" },
  desc: { fontSize: 13, color: colors.muted, marginBottom: 10, lineHeight: 19 },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink3, marginBottom: 8 },
  hint: { fontSize: 12, fontWeight: "400", color: colors.coolgray },
  count: { fontSize: 12, color: colors.coolgray },
  imageRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  imageBox: { width: 112, aspectRatio: 400 / 244, borderRadius: 10, borderWidth: 1, borderStyle: "dashed", borderColor: colors.lightgray, backgroundColor: colors.surface2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  imageBoxText: { fontSize: 12, fontWeight: "600", color: colors.coolgray },
  overlay: { backgroundColor: "rgba(0,0,0,0.35)", alignItems: "center", justifyContent: "center" },
  imageTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
  imageDesc: { fontSize: 12, color: colors.coolgray, marginTop: 2 },
  imageRemove: { fontSize: 12, fontWeight: "600", color: colors.muted, textDecorationLine: "underline", marginTop: 4 },
  dock: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 10, gap: 8, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: "rgba(255,255,255,0.96)" },
  status: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, color: colors.muted },
})

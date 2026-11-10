import { yupResolver } from "@hookform/resolvers/yup"
import React, { useState } from "react"
import { Controller, FieldErrors, useForm } from "react-hook-form"
import { KeyboardAvoidingView, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"

import { FieldError } from "@/components/jobs/FormFields"
import { ImagePickerField } from "@/components/ui/ImagePickerField"
import { Button, Chip, TextField } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { competitionSchema } from "@/lib/schemas"
import { UploadTarget } from "@/types"
import { ApplyMethod, COMPETITION, COMPETITION_AGES, COMPETITION_AREAS, COMPETITION_DIVISIONS } from "@/types/competitions"

export type CompetitionFormData = {
  title: string
  host: string
  organizer: string
  divisions: string[]
  ages: string[]
  area: string
  venue: string
  openAt: string
  closeAt: string
  heldAt: string
  resultAt: string
  applyMethod: ApplyMethod
  applyLink: string
  email: string
  tel: string
  fee: string
  prize: string
  description: string
  posterUrl: string
}

type Props = {
  competition?: COMPETITION
  isLoading: boolean
  onSubmit: (data: CompetitionFormData) => void
}

const STEPS = ["기본 정보", "일정", "접수·시상", "포스터"]
const STEP_FIELDS: (keyof CompetitionFormData)[][] = [
  ["title", "host", "organizer", "divisions", "ages", "area", "venue"],
  ["openAt", "closeAt", "heldAt", "resultAt"],
  ["applyMethod", "applyLink", "email", "tel", "fee", "prize"],
  ["posterUrl", "description"],
]
const APPLY_METHODS: { value: ApplyMethod; label: string; desc: string }[] = [
  { value: "LINK", label: "주최 홈페이지·접수 폼 링크", desc: "참가자가 외부 페이지에서 접수합니다" },
  { value: "EMAIL", label: "이메일 접수", desc: "참가 신청서를 메일로 받습니다" },
  { value: "POST", label: "우편·방문 접수", desc: "주소와 안내를 소개란에 적어 주세요" },
]

/**
 * 콩쿠르 등록·수정 — 4단계(기본 → 일정 → 접수·시상 → 포스터). 단계마다 그 단계 필드만 검증하고 넘어간다.
 * 웹 components/competitions/CompetitionForm 과 같은 구성. 날짜는 YYYY-MM-DD 로 직접 입력한다.
 */
export const CompetitionForm = ({ competition, isLoading, onSubmit }: Props) => {
  const [step, setStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { errorToast } = useToast()
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CompetitionFormData>({
    resolver: yupResolver(competitionSchema) as any,
    defaultValues: {
      title: competition?.title ?? "",
      host: competition?.host ?? "",
      organizer: competition?.organizer ?? "",
      divisions: competition?.divisions ?? [],
      ages: competition?.ages ?? [],
      area: competition?.area ?? "",
      venue: competition?.venue ?? "",
      openAt: competition?.openAt ?? "",
      closeAt: competition?.closeAt ?? "",
      heldAt: competition?.heldAt ?? "",
      resultAt: competition?.resultAt ?? "",
      applyMethod: competition?.applyMethod ?? "LINK",
      applyLink: competition?.applyLink ?? "",
      email: competition?.email ?? "",
      tel: competition?.tel ?? "",
      fee: competition?.fee ?? "",
      prize: competition?.prize ?? "",
      description: competition?.description ?? "",
      posterUrl: competition?.posterUrl ?? "",
    },
  })

  const divisions = watch("divisions") ?? []
  const ages = watch("ages") ?? []
  const area = watch("area")
  const applyMethod = watch("applyMethod")

  const toggle = (key: "divisions" | "ages", value: string) => {
    const current = watch(key) ?? []
    setValue(key, current.includes(value) ? current.filter(v => v !== value) : [...current, value], { shouldValidate: true })
  }

  const next = async () => {
    if (!(await trigger(STEP_FIELDS[step]))) {
      errorToast("입력을 확인해 주세요.")
      return
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  /** 오류가 난 필드가 어느 단계에 있는지 */
  const stepOf = (field: string) => STEP_FIELDS.findIndex(fields => fields.includes(field as keyof CompetitionFormData))
  const errorList = Object.entries(errors)
    .map(([field, error]) => ({ field, step: stepOf(field), message: (error as { message?: string })?.message ?? "" }))
    .filter(e => e.message)
    .sort((a, b) => a.step - b.step)

  /** 등록 버튼을 눌렀는데 다른 단계에 오류가 있으면 — 그 단계로 옮기고 무엇이 문제인지 바로 보여준다 */
  const onInvalid = (invalid: FieldErrors<CompetitionFormData>) => {
    setSubmitted(true)
    const first = Object.keys(invalid)
      .map(stepOf)
      .filter(i => i >= 0)
      .sort((a, b) => a - b)[0]
    const firstMessage = Object.values(invalid).find(e => e?.message)?.message as string | undefined
    if (first !== undefined && first !== step) setStep(first)
    errorToast(`${first !== undefined ? `${first + 1}단계 ` : ""}입력을 확인해 주세요${firstMessage ? `: ${firstMessage}` : "."}`)
  }

  const text = (name: keyof CompetitionFormData, props: Partial<React.ComponentProps<typeof TextField>> = {}) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <TextField
          value={(field.value as string) ?? ""}
          onChangeText={field.onChange}
          error={errors[name]?.message as string | undefined}
          containerStyle={{ marginBottom: 14 }}
          {...props}
        />
      )}
    />
  )

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }} keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        {!competition ? (
          <Text style={styles.lead}>주최·주관 단체가 직접 올리는 공고입니다. 내용을 확인한 뒤 게시되며(보통 1영업일), 그 전까지는 나에게만 보입니다.</Text>
        ) : null}

        <View style={styles.progress}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.bar, i <= step && { backgroundColor: colors.ink }]} />
          ))}
        </View>
        <View style={styles.stepLabels}>
          {STEPS.map((label, i) => (
            <Text key={label} style={[styles.stepLabel, i === step && styles.stepLabelOn]}>
              {i + 1} {label}
            </Text>
          ))}
        </View>

        {step === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>기본 정보</Text>
            {text("title", { label: "대회명", required: true, placeholder: "예) 제13회 수원시전국음악콩쿠르" })}
            {text("host", { label: "주최", required: true })}
            {text("organizer", { label: "주관", placeholder: "주최와 같으면 비워 두세요" })}
            <Text style={styles.label}>
              부문 <Text style={{ color: colors.error }}>*</Text> <Text style={styles.hint}>여러 개 선택</Text>
            </Text>
            <View style={styles.chips}>
              {COMPETITION_DIVISIONS.map(d => (
                <Chip key={d} label={d} selected={divisions.includes(d)} onPress={() => toggle("divisions", d)} />
              ))}
            </View>
            <FieldError message={errors.divisions?.message as string | undefined} />
            <Text style={[styles.label, { marginTop: 14 }]}>
              참가 대상 <Text style={styles.hint}>비우면 전연령</Text>
            </Text>
            <View style={styles.chips}>
              {COMPETITION_AGES.map(a => (
                <Chip key={a} label={a} selected={ages.includes(a)} onPress={() => toggle("ages", a)} />
              ))}
            </View>
            <Text style={[styles.label, { marginTop: 14 }]}>
              지역 <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <View style={styles.chips}>
              {COMPETITION_AREAS.map(a => (
                <Chip key={a} label={a === "전국" ? "전국(온라인)" : a} selected={area === a} onPress={() => setValue("area", a, { shouldValidate: true })} />
              ))}
            </View>
            <FieldError message={errors.area?.message} />
            <View style={{ height: 14 }} />
            {text("venue", { label: "대회 장소", placeholder: "예) 수원문화원 빛누리아트홀" })}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>일정</Text>
            {text("openAt", { label: "접수 시작", required: true, placeholder: "2026-11-20", keyboardType: "numbers-and-punctuation" })}
            {text("closeAt", { label: "접수 마감", required: true, placeholder: "2026-12-19 (그날 23:59 까지)", keyboardType: "numbers-and-punctuation" })}
            {text("heldAt", { label: "대회일", placeholder: "2027-01-16", keyboardType: "numbers-and-punctuation" })}
            {text("resultAt", { label: "결과 발표", placeholder: "2027-01-18", keyboardType: "numbers-and-punctuation" })}
            <View style={styles.callout}>
              <Text style={styles.calloutText}>접수 마감 3일 전에 관심 등록한 회원에게 알림이 나갑니다. 일정이 바뀌면 공고 상세에서 수정해 주세요.</Text>
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>접수 방법·시상</Text>
            <Text style={styles.label}>
              접수 방법 <Text style={{ color: colors.error }}>*</Text>
            </Text>
            <View style={{ gap: 8, marginBottom: 14 }}>
              {APPLY_METHODS.map(m => {
                const on = applyMethod === m.value
                return (
                  <Pressable key={m.value} onPress={() => setValue("applyMethod", m.value, { shouldValidate: true })} style={[styles.radio, on && styles.radioOn]}>
                    <View style={[styles.radioDot, on && styles.radioDotOn]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.radioLabel}>{m.label}</Text>
                      <Text style={styles.radioDesc}>{m.desc}</Text>
                    </View>
                  </Pressable>
                )
              })}
            </View>
            {applyMethod === "LINK" ? text("applyLink", { label: "접수 링크", required: true, placeholder: "https://", autoCapitalize: "none", keyboardType: "url" }) : null}
            {text("email", { label: applyMethod === "EMAIL" ? "접수 이메일" : "문의 이메일", required: applyMethod === "EMAIL", autoCapitalize: "none", keyboardType: "email-address" })}
            {text("tel", { label: "문의 전화", keyboardType: "phone-pad" })}
            {text("fee", { label: "참가비", placeholder: "예) 부문당 60,000원 · 무료" })}
            {text("prize", { label: "시상 내역", multiline: true, placeholder: "대상 1명 300만원\n부문별 1위 100만원 · 2위 50만원" })}
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>포스터·소개</Text>
            <Controller
              control={control}
              name="posterUrl"
              render={({ field }) => (
                <ImagePickerField
                  label="포스터 이미지 (세로형 권장)"
                  value={field.value || ""}
                  onChange={field.onChange}
                  target={UploadTarget.JOB}
                  aspectRatio={3 / 4}
                  aspect={[3, 4]}
                  style={{ marginBottom: 14, width: 150 }}
                />
              )}
            />
            <Text style={[styles.hint, { marginBottom: 14 }]}>포스터가 없으면 부문 색 바탕에 부문·연도가 대신 보입니다.</Text>
            {text("description", { label: "소개·안내 문구", multiline: true, placeholder: "대회 소개, 심사 방식, 과제곡 안내, 우편 접수 주소 등" })}
            <View style={[styles.callout, { backgroundColor: "#FFF3E0" }]}>
              <Text style={[styles.calloutText, { color: "#9A5B00" }]}>이미 수집된 같은 대회가 있으면 등록 후 그 공고와 합쳐지고, 이 등록본이 대표로 보입니다.</Text>
            </View>
          </View>
        ) : null}

        {submitted && errorList.length > 0 ? (
          <View style={styles.errorBox} accessibilityRole="alert">
            <Text style={styles.errorTitle}>아직 고쳐야 할 항목이 있어요</Text>
            {errorList.map(e => (
              <Pressable key={e.field} onPress={() => setStep(e.step)} hitSlop={4}>
                <Text style={styles.errorItem}>
                  • {e.step + 1}단계 · {e.message}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={styles.nav}>
          <Button title="이전" variant="outline" disabled={step === 0} onPress={() => setStep(s => Math.max(0, s - 1))} />
          {step < STEPS.length - 1 ? (
            <Button title="다음" onPress={next} />
          ) : (
            <Button title={competition ? "수정 완료" : "등록 요청"} loading={isLoading} onPress={() => void handleSubmit(onSubmit, onInvalid)()} />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  lead: { fontSize: 14, lineHeight: 21, color: colors.muted, marginBottom: 16 },
  progress: { flexDirection: "row", gap: 6, marginBottom: 6 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.line },
  stepLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  stepLabel: { fontSize: 12, color: colors.coolgray },
  stepLabelOn: { color: colors.ink, fontWeight: "700" },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: 16, padding: 16 },
  cardTitle: { fontSize: 16, fontWeight: "800", color: colors.ink, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "600", color: colors.ink3, marginBottom: 8 },
  hint: { fontSize: 12, fontWeight: "400", color: colors.coolgray },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  callout: { marginTop: 4, backgroundColor: colors.tagBg, borderRadius: 12, padding: 12 },
  calloutText: { fontSize: 13, lineHeight: 19, color: colors.tagText },
  radio: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderWidth: 1, borderColor: colors.line, borderRadius: 12, padding: 12 },
  radioOn: { borderColor: colors.main, backgroundColor: colors.tagBg },
  radioDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.lightgray, marginTop: 1 },
  radioDotOn: { borderColor: colors.main, borderWidth: 6 },
  radioLabel: { fontSize: 14, fontWeight: "600", color: colors.ink },
  radioDesc: { fontSize: 13, color: colors.muted, marginTop: 2 },
  nav: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 20 },
  errorBox: { marginTop: 16, borderWidth: 1, borderColor: "#F5C2C7", backgroundColor: "#FDECEC", borderRadius: 12, padding: 12, gap: 4 },
  errorTitle: { fontSize: 13, fontWeight: "700", color: "#B42318", marginBottom: 2 },
  errorItem: { fontSize: 13, lineHeight: 20, color: "#B42318", textDecorationLine: "underline" },
})

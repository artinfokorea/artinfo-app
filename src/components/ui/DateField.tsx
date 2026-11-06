import DateTimePicker from "@react-native-community/datetimepicker"
import dayjs from "dayjs"
import React, { useState } from "react"
import { Modal, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"

type Props = {
  label?: string
  required?: boolean
  /** mode="date" 이면 'YYYY-MM-DD', mode="time" 이면 'HH:mm' */
  value?: string
  mode?: "date" | "time"
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  minimumDate?: Date
  maximumDate?: Date
  containerStyle?: StyleProp<ViewStyle>
  /** 좁은 칸용: 아이콘 없이 작은 여백 */
  compact?: boolean
}

const FORMAT = { date: "YYYY-MM-DD", time: "HH:mm" } as const

const toDate = (value: string | undefined, mode: "date" | "time") => {
  if (!value) return new Date()
  const parsed = mode === "date" ? dayjs(value) : dayjs(`2000-01-01T${value}`)
  return parsed.isValid() ? parsed.toDate() : new Date()
}

/** 웹의 <input type="date|time"> 대체 — 누르면 하단 시트에 iOS 날짜/시간 선택기가 뜬다. */
export const DateField = ({
  label,
  required,
  value,
  mode = "date",
  onChange,
  placeholder,
  error,
  minimumDate,
  maximumDate,
  containerStyle,
  compact,
}: Props) => {
  const insets = useSafeAreaInsets()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Date>(() => toDate(value, mode))

  const openSheet = () => {
    setDraft(toDate(value, mode))
    setOpen(true)
  }

  const confirm = () => {
    onChange(dayjs(draft).format(FORMAT[mode]))
    setOpen(false)
  }

  return (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={{ color: colors.error }}> *</Text> : null}
        </Text>
      ) : null}
      <Pressable
        onPress={openSheet}
        accessibilityRole="button"
        style={[styles.input, compact && styles.compact, !!error && { borderColor: colors.error }]}
      >
        <Text style={[styles.value, compact && { fontSize: 15 }, !value && { color: colors.gray400 }]}>
          {value || placeholder || FORMAT[mode]}
        </Text>
        {compact ? null : (
          <Icon name={mode === "date" ? "calendar" : "clock"} size={16} color={colors.gray400} />
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{label ?? (mode === "date" ? "날짜 선택" : "시간 선택")}</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={10}>
              <Icon name="xmark" size={18} color={colors.gray500} />
            </Pressable>
          </View>
          <DateTimePicker
            value={draft}
            mode={mode}
            display="spinner"
            locale="ko-KR"
            minuteInterval={mode === "time" ? 5 : undefined}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={(_, date) => date && setDraft(date)}
            style={{ alignSelf: "stretch" }}
          />
          <Button title="확인" onPress={confirm} />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: "600", color: colors.gray800 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  compact: { paddingHorizontal: 8, justifyContent: "center", minHeight: 40 },
  value: { fontSize: 16, color: colors.black },
  error: { color: colors.error, fontSize: 13 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", color: colors.black },
})

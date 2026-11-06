import React, { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native"

import { AddressSearchSheet } from "@/components/ui/AddressSearchSheet"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"
import { MAJOR } from "@/types/majors"

/** 웹 폼의 밑줄 입력창 (border-b-2 border-whitesmoke) */
export const UnderlineInput = ({ error, style, ...props }: TextInputProps & { error?: string }) => (
  <View style={{ marginBottom: 8 }}>
    <TextInput
      placeholderTextColor={colors.gray400}
      style={[styles.underline, !!error && { borderBottomColor: colors.error }, style]}
      {...props}
    />
    <FieldError message={error} />
  </View>
)

/**
 * 주소 입력 — 누르면 다음 우편번호 검색이 뜨고, 선택한 주소(data.address)를 채운다.
 * 웹 FullTimeJobForm / PartTimeForm 의 PostCodeDialog 와 같은 동작.
 */
export const AddressField = ({
  value,
  onChange,
  placeholder = "주소를 검색해주세요.",
  error,
}: {
  value?: string
  onChange: (address: string) => void
  placeholder?: string
  error?: string
}) => {
  const [open, setOpen] = useState(false)
  return (
    <View style={{ marginBottom: 8 }}>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        style={[styles.underline, styles.addressRow, !!error && { borderBottomColor: colors.error }]}
      >
        <Text style={[styles.addressText, !value && { color: colors.gray400 }]} numberOfLines={2}>
          {value || placeholder}
        </Text>
        <Icon name="magnifyingglass" size={16} color={colors.gray400} />
      </Pressable>
      <FieldError message={error} />
      <AddressSearchSheet
        visible={open}
        onClose={() => setOpen(false)}
        onSelect={result => onChange(result.address)}
      />
    </View>
  )
}

export const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.error}>{message}</Text> : null

/**
 * "+ 전공" 버튼과 선택된 전공 뱃지 (웹 FullTimeJobForm 과 같은 배치).
 * 전공 개수 제한이 없어 고른 전공을 모두 줄바꿈으로 보여주고, onRemove 를 주면 뱃지의 X 로 바로 뺄 수 있다.
 * 버튼 옆에는 비었을 때 emptyText, 골랐을 때 "N개 선택" 을 보여준다 (오류가 있으면 오류 문구만).
 */
export const MajorPickerRow = ({
  majors,
  onPress,
  onRemove,
  emptyText,
  error,
}: {
  majors: MAJOR[]
  onPress: () => void
  onRemove?: (major: MAJOR) => void
  emptyText: string
  error?: string
}) => (
  <View style={{ marginVertical: 8, gap: 8 }}>
    <View style={styles.majorRow}>
      <Pressable onPress={onPress} style={styles.outlineButton}>
        <Icon name="plus" size={13} color={colors.main} />
        <Text style={styles.outlineButtonText}>전공</Text>
      </Pressable>
      {error ? null : majors.length === 0 ? (
        <Text style={styles.hint}>{emptyText}</Text>
      ) : (
        <Text style={styles.hint}>
          <Text style={styles.hintCount}>{majors.length}</Text>개 선택
        </Text>
      )}
    </View>
    {majors.length > 0 ? (
      <View style={styles.badges} accessibilityLabel="선택한 전공">
        {majors.map(major => (
          <View key={major.id} style={styles.badge}>
            <Text style={styles.badgeText}>{major.koName}</Text>
            {onRemove ? (
              <Pressable
                onPress={() => onRemove(major)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${major.koName} 삭제`}
                style={styles.badgeRemove}
              >
                <Icon name="xmark" size={10} color={colors.white} weight="bold" />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    ) : null}
    <FieldError message={error} />
  </View>
)

export const OutlineButton = ({ title, onPress, icon }: { title: string; onPress: () => void; icon?: any }) => (
  <Pressable onPress={onPress} style={styles.outlineButton}>
    {icon ? <Icon name={icon} size={13} color={colors.main} /> : null}
    <Text style={styles.outlineButtonText}>{title}</Text>
  </Pressable>
)

export const formStyles = StyleSheet.create({
  heading: { textAlign: "center", fontSize: 17, fontWeight: "700", color: colors.black, marginVertical: 16 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 24 },
  pill: { borderRadius: 24, paddingHorizontal: 24 },
})

const styles = StyleSheet.create({
  underline: {
    borderBottomWidth: 2,
    borderBottomColor: colors.whitesmoke,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.black,
  },
  addressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  addressText: { flex: 1, fontSize: 16, color: colors.black },
  error: { color: colors.error, fontSize: 12, fontWeight: "600", marginTop: 4 },
  majorRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  outlineButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray200,
    alignSelf: "flex-start",
  },
  outlineButtonText: { color: colors.main, fontSize: 14, fontWeight: "500" },
  hint: { fontSize: 13, color: colors.silver, flexShrink: 1 },
  hintCount: { color: colors.main, fontWeight: "700" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: {
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.main,
  },
  badgeText: { color: colors.white, fontSize: 13, fontWeight: "600" },
  badgeRemove: { padding: 2, borderRadius: 999 },
})

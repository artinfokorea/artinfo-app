import React from "react"
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native"

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

export const FieldError = ({ message }: { message?: string }) =>
  message ? <Text style={styles.error}>{message}</Text> : null

/** "+ 전공" 버튼과 선택된 전공 뱃지 */
export const MajorPickerRow = ({
  majors,
  onPress,
  emptyText,
  error,
  collapse = true,
}: {
  majors: MAJOR[]
  onPress: () => void
  emptyText: string
  error?: string
  /** true 면 웹처럼 "OO 외 N" 한 개로 줄여 보여준다 */
  collapse?: boolean
}) => (
  <View style={{ marginVertical: 8 }}>
    <View style={styles.majorRow}>
      <Pressable onPress={onPress} style={styles.outlineButton}>
        <Icon name="plus" size={13} color={colors.main} />
        <Text style={styles.outlineButtonText}>전공</Text>
      </Pressable>
      {majors.length === 0 && !error ? <Text style={styles.hint}>{emptyText}</Text> : null}
      {collapse
        ? majors.slice(0, 1).map(major => (
            <View key={major.id} style={styles.badge}>
              <Text style={styles.badgeText}>
                {majors.length > 1 ? `${major.koName} 외 ${majors.length - 1}` : major.koName}
              </Text>
            </View>
          ))
        : majors.map(major => (
            <View key={major.id} style={styles.badge}>
              <Text style={styles.badgeText}>{major.koName}</Text>
            </View>
          ))}
    </View>
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
  badge: { height: 32, justifyContent: "center", paddingHorizontal: 10, borderRadius: 8, backgroundColor: colors.main },
  badgeText: { color: colors.white, fontSize: 13, fontWeight: "600" },
})

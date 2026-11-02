import React from "react"
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

/* ------------------------------------------------------------------ Button */

type ButtonVariant = "primary" | "outline" | "ghost" | "danger" | "muted"

type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  title: string
  variant?: ButtonVariant
  loading?: boolean
  size?: "sm" | "md" | "lg"
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

export const Button = ({
  title,
  variant = "primary",
  loading,
  disabled,
  size = "md",
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  const isDisabled = disabled || loading
  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        buttonSize[size],
        buttonVariant[variant],
        pressed && { opacity: 0.8 },
        isDisabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#fff" : colors.main}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            { fontSize: size === "sm" ? 13 : size === "lg" ? 17 : 15 },
            buttonTextVariant[variant],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  )
}

const buttonSize = StyleSheet.create({
  sm: { height: 34, paddingHorizontal: 12 },
  md: { height: 44, paddingHorizontal: 16 },
  lg: { height: 52, paddingHorizontal: 20 },
})

const buttonVariant = StyleSheet.create({
  primary: { backgroundColor: colors.main },
  outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.main },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.error },
  muted: { backgroundColor: colors.whitesmoke },
})

const buttonTextVariant = StyleSheet.create({
  primary: { color: colors.white },
  outline: { color: colors.main },
  ghost: { color: colors.main },
  danger: { color: colors.white },
  muted: { color: colors.gray700 },
})

/* --------------------------------------------------------------- TextField */

type TextFieldProps = TextInputProps & {
  label?: string
  required?: boolean
  error?: string
  containerStyle?: StyleProp<ViewStyle>
  right?: React.ReactNode
  inputRef?: React.Ref<any>
}

export const TextField = ({
  label,
  required,
  error,
  containerStyle,
  right,
  style,
  multiline,
  inputRef,
  ...props
}: TextFieldProps) => (
    <View style={[{ gap: 6 }, containerStyle]}>
      {label ? (
        <Text style={styles.label}>
          {label}
          {required ? <Text style={{ color: colors.error }}> *</Text> : null}
        </Text>
      ) : null}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <TextInput
          ref={inputRef}
          placeholderTextColor={colors.gray400}
          multiline={multiline}
          style={[
            styles.input,
            multiline && { minHeight: 120, paddingTop: 12, textAlignVertical: "top" },
            !!error && { borderColor: colors.error },
            { flex: 1 },
            style,
          ]}
          {...props}
        />
        {right}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
)

/* -------------------------------------------------------------------- Chip */

export const Chip = ({
  label,
  selected,
  onPress,
  style,
}: {
  label: string
  selected?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, selected && styles.chipSelected, style]}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
  </Pressable>
)

/* ---------------------------------------------------------------- Checkbox */

export const Checkbox = ({
  label,
  checked,
  onPress,
}: {
  label: string
  checked: boolean
  onPress: () => void
}) => (
  <Pressable
    onPress={onPress}
    style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 6 }}
    accessibilityRole="checkbox"
    accessibilityState={{ checked }}
  >
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked ? <Icon name="checkmark" size={12} color="#fff" weight="bold" /> : null}
    </View>
    <Text style={{ fontSize: 15, color: colors.gray800 }}>{label}</Text>
  </Pressable>
)

/* -------------------------------------------------------------- Misc small */

export const Separator = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: colors.gray200 }, style]} />
)

export const EmptyDataMessage = ({ message = "데이터가 없습니다." }: { message?: string }) => (
  <Text style={{ paddingVertical: 16, textAlign: "center", color: colors.grayfont }}>
    {message}
  </Text>
)

export const Loading = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[{ paddingVertical: 32, alignItems: "center" }, style]}>
    <ActivityIndicator color={colors.main} />
  </View>
)

export const Badge = ({
  label,
  color = colors.gray600,
  backgroundColor = colors.badge,
}: {
  label: string
  color?: string
  backgroundColor?: string
}) => (
  <View style={{ backgroundColor, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: "flex-start" }}>
    <Text style={{ color, fontSize: 12, fontWeight: "600" }}>{label}</Text>
  </View>
)

/** 홈 화면 섹션 제목 + "더보기" */
export const SectionHeader = ({
  title,
  icon,
  onMore,
}: {
  title: string
  icon?: React.ReactNode
  onMore?: () => void
}) => (
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      {icon}
      <Text style={{ fontSize: 20, fontWeight: "700", color: colors.black }}>{title}</Text>
    </View>
    {onMore ? (
      <Pressable onPress={onMore} hitSlop={8}>
        <Text style={{ fontWeight: "700", color: colors.silver }}>더보기</Text>
      </Pressable>
    ) : null}
  </View>
)

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  buttonText: { fontWeight: "700" },
  label: { fontSize: 15, fontWeight: "600", color: colors.gray800 },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.black,
    backgroundColor: colors.white,
  },
  error: { color: colors.error, fontSize: 13 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray300,
    backgroundColor: colors.white,
  },
  chipSelected: { borderColor: colors.main, backgroundColor: colors.aliceblue },
  chipText: { fontSize: 14, color: colors.gray600, fontWeight: "500" },
  chipTextSelected: { color: colors.main, fontWeight: "700" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.gray300,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { backgroundColor: colors.main, borderColor: colors.main },
})

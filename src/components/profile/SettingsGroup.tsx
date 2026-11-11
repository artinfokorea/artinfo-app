import { IconName , Icon } from "@/components/ui/Icon"
import React from "react"
import { Pressable, StyleProp, StyleSheet, Switch, Text, View, ViewStyle } from "react-native"

import { colors } from "@/constants/theme"

type GroupProps = {
  /** 카드 위에 작게 보이는 섹션 제목 */
  title?: string
  /** 카드 아래 설명(알림 안내 등) */
  footer?: string
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
}

/** iOS 설정 앱 스타일의 묶음 카드 — 안에 SettingsRow 를 나열한다 */
export const SettingsGroup = ({ title, footer, children, style }: GroupProps) => {
  const rows = React.Children.toArray(children).filter(Boolean)
  return (
    <View style={[styles.group, style]}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.card}>
        {rows.map((row, index) => (
          <React.Fragment key={index}>
            {index > 0 ? <View style={styles.divider} /> : null}
            {row}
          </React.Fragment>
        ))}
      </View>
      {footer ? <Text style={styles.groupFooter}>{footer}</Text> : null}
    </View>
  )
}

type RowProps = {
  /** SF Symbols 아이콘 — 없으면 아이콘 칸 없이 왼쪽 정렬 */
  icon?: IconName
  iconColor?: string
  label: string
  /** 오른쪽에 회색으로 보이는 값. 없으면 placeholder 를 보여준다 */
  value?: string | null
  placeholder?: string
  /** 값이 길어 한 줄에 안 들어갈 때 라벨 아래 줄로 내린다 */
  stacked?: boolean
  onPress?: () => void
  /** true 면 스위치 행 — onToggle 과 함께 쓴다 */
  switchValue?: boolean
  onToggle?: (value: boolean) => void
  /** 라벨을 빨간색으로 (로그아웃·탈퇴) */
  destructive?: boolean
  /** 오른쪽 커스텀 요소(뱃지 등). 있으면 chevron 대신 그린다 */
  right?: React.ReactNode
  disabled?: boolean
}

export const SettingsRow = ({
  icon,
  iconColor = colors.ink3,
  label,
  value,
  placeholder,
  stacked,
  onPress,
  switchValue,
  onToggle,
  destructive,
  right,
  disabled,
}: RowProps) => {
  const isSwitch = typeof switchValue === "boolean"
  const pressable = !!onPress && !isSwitch
  const labelColor = destructive ? colors.error : colors.ink

  const trailing = isSwitch ? (
    <Switch
      value={switchValue}
      onValueChange={onToggle}
      disabled={disabled}
      trackColor={{ true: colors.main, false: colors.lightgray }}
    />
  ) : right ? (
    right
  ) : pressable ? (
    <Icon name="chevron.right" size={13} color={colors.gray400} weight="semibold" />
  ) : null

  const valueText = value ? (
    <Text style={[styles.value, stacked && styles.valueStacked]} numberOfLines={stacked ? 2 : 1}>
      {value}
    </Text>
  ) : placeholder ? (
    <Text style={[styles.value, styles.placeholder, stacked && styles.valueStacked]} numberOfLines={1}>
      {placeholder}
    </Text>
  ) : null

  return (
    // 스위치 행은 행 자체를 누르지 않게 둔다 — 행 탭과 스위치의 onValueChange 가 같이 발생해 값이 두 번 뒤집히는 걸 막는다
    <Pressable
      onPress={onPress}
      disabled={disabled || !pressable}
      style={({ pressed }) => [styles.row, pressed && pressable && styles.rowPressed]}
      accessibilityRole={pressable ? "button" : undefined}
    >
      {icon ? (
        <View style={styles.iconWrap}>
          <Icon name={icon} size={17} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.body}>
        <View style={styles.labelLine}>
          <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
            {label}
          </Text>
          {!stacked ? valueText : null}
        </View>
        {stacked ? valueText : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  groupTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.muted,
    paddingHorizontal: 4,
  },
  groupFooter: { fontSize: 12, color: colors.muted, paddingHorizontal: 4, lineHeight: 17 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    overflow: "hidden",
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.line, marginLeft: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: colors.white,
  },
  rowPressed: { backgroundColor: colors.surface2 },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 3 },
  labelLine: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { fontSize: 16, fontWeight: "500", flexShrink: 0 },
  value: { flex: 1, fontSize: 15, color: colors.muted, textAlign: "right" },
  valueStacked: { textAlign: "left", fontSize: 14, lineHeight: 19 },
  placeholder: { color: colors.main, fontWeight: "500" },
  trailing: { marginLeft: 2 },
})

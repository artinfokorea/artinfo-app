import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"
import { MAJOR } from "@/types/majors"
import { USER } from "@/types/users"

type Props = {
  user?: USER
  onEdit: () => void
}

/** 내 정보 상단 — 아바타·이름·닉네임·전공 뱃지와 프로필 수정 버튼 */
export const ProfileHeader = ({ user, onEdit }: Props) => {
  const majors = (user?.majors ?? []) as MAJOR[]
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <FallbackImage src={user?.iconImageUrl} style={styles.avatar} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.name} numberOfLines={1}>
            {user?.name || "이름 없음"}
          </Text>
          {user?.nickname ? (
            <Text style={styles.nickname} numberOfLines={1}>
              @{user.nickname}
            </Text>
          ) : null}
        </View>
        <Pressable onPress={onEdit} style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]} hitSlop={6}>
          <Icon name="pencil" size={13} color={colors.ink2} weight="semibold" />
          <Text style={styles.editText}>수정</Text>
        </Pressable>
      </View>

      {majors.length ? (
        <View style={styles.badges}>
          {majors.map(major => (
            <View key={major.id} style={styles.badge}>
              <Text style={styles.badgeText}>{major.koName}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Pressable onPress={onEdit} hitSlop={6}>
          <Text style={styles.emptyMajor}>전공을 등록하면 맞춤 채용·레슨 정보를 받을 수 있어요</Text>
        </Pressable>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    padding: 18,
    gap: 14,
  },
  top: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface },
  name: { fontSize: 20, fontWeight: "700", color: colors.ink, letterSpacing: -0.3 },
  nickname: { fontSize: 14, color: colors.muted },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.surface,
  },
  editText: { fontSize: 13, fontWeight: "600", color: colors.ink2 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  badge: { backgroundColor: colors.tagBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: "600", color: colors.tagText },
  emptyMajor: { fontSize: 13, color: colors.main, fontWeight: "500" },
})

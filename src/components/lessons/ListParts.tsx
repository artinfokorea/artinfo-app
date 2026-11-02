import React from "react"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

/**
 * 웹 MobileFilterTab / PerformanceMobileFilterTab 모양의 필터 바.
 * 테두리 박스 안에 버튼이 칸으로 나뉘어 있고, 누르면 선택 시트를 연다.
 */
export const FilterTabBar = ({
  tabs,
}: {
  tabs: { key: string; label: string; active?: boolean; onPress: () => void }[]
}) => (
  <View style={styles.filterBar}>
    {tabs.map((tab, index) => (
      <Pressable
        key={tab.key}
        onPress={tab.onPress}
        style={[styles.filterTab, index > 0 && styles.filterDivider]}
      >
        <Text style={[styles.filterText, tab.active && { fontWeight: "700" }]} numberOfLines={1}>
          {tab.label}
        </Text>
        <Icon name="chevron.down" size={11} color={colors.main} />
      </Pressable>
    ))}
  </View>
)

/** 웹 components/common/AddButton: 오른쪽 아래 떠 있는 + 버튼 */
export const FloatingAddButton = ({ onPress }: { onPress: () => void }) => {
  const insets = useSafeAreaInsets()
  return (
    <Pressable
      onPress={onPress}
      style={[styles.fab, { bottom: 16 + Math.max(0, insets.bottom - 34) }]}
      accessibilityLabel="등록하기"
    >
      <Icon name="plus" size={22} color={colors.main} weight="semibold" />
    </Pressable>
  )
}

/** 웹 components/common/ItemManageBox: 수정 / 삭제 아이콘 버튼 */
export const ItemManageBox = ({
  onEdit,
  onDelete,
  deleteTitle,
  deleteMessage,
}: {
  onEdit: () => void
  onDelete: () => void
  deleteTitle: string
  deleteMessage: string
}) => (
  <View style={{ flexDirection: "row", gap: 8 }}>
    <Pressable style={styles.manageButton} onPress={onEdit} accessibilityLabel="수정">
      <Icon name="pencil" size={18} color={colors.gray700} />
    </Pressable>
    <Pressable
      style={styles.manageButton}
      accessibilityLabel="삭제"
      onPress={() =>
        Alert.alert(deleteTitle, deleteMessage, [
          { text: "취소", style: "cancel" },
          { text: "삭제", style: "destructive", onPress: onDelete },
        ])
      }
    >
      <Icon name="trash" size={18} color={colors.gray700} />
    </Pressable>
  </View>
)

/** 목록 상단: 안내 문구(총 개수) */
export const ListTitle = ({ children }: { children: React.ReactNode }) => (
  <Text style={styles.listTitle}>{children}</Text>
)

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 6,
    overflow: "hidden",
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 10,
  },
  filterDivider: { borderLeftWidth: 1, borderLeftColor: colors.gray200 },
  filterText: { color: colors.main, fontSize: 14 },
  fab: {
    position: "absolute",
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  manageButton: {
    borderWidth: 2,
    borderColor: colors.whitesmoke,
    borderRadius: 8,
    padding: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
})

/** 2열 그리드에서 마지막 줄 아이템이 혼자 꽉 차지 않도록 빈 칸을 채운다. */
export function padGrid<T>(items: T[], columns = 2): (T | null)[] {
  const rest = items.length % columns
  return rest === 0 ? items : [...items, ...Array(columns - rest).fill(null)]
}

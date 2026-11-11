import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { Icon } from "@/components/ui/Icon"
import { Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { PROVINCE } from "@/types"

/**
 * 웹 components/dialog/DistrictDialog: 시·도 → 시·군·구 2단계 선택.
 * 하위 지역이 없으면 시·도 이름만 돌려준다.
 */
export const DistrictSheet = ({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean
  onClose: () => void
  onSelect: (area: string) => void
}) => {
  const insets = useSafeAreaInsets()
  const queryClient = useQueryClient()
  const [province, setProvince] = useState<PROVINCE>()

  const { data: step1 } = useQuery({ ...queries.provinces.list(), enabled: visible })
  const { data: step2, isFetching } = useQuery({
    ...queries.provinces.list(province?.id),
    enabled: !!province,
  })

  const close = () => {
    setProvince(undefined)
    onClose()
  }

  /** 시·도를 고르면 하위 지역을 불러오고, 없으면 시·도 이름으로 바로 선택한다 (웹과 동일) */
  const pickProvince = async (item: PROVINCE) => {
    const districts = await queryClient.fetchQuery(queries.provinces.list(item.id))
    if (districts.provinces.length === 0) {
      onSelect(item.name)
      close()
    } else {
      setProvince(item)
    }
  }

  const list = province ? step2?.provinces : step1?.provinces


  return (
    <Modal statusBarTranslucent navigationBarTranslucent visible={visible} transparent animationType="slide" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.header}>
          {province ? (
            <Pressable onPress={() => setProvince(undefined)} hitSlop={10} style={styles.headerSide}>
              <Icon name="chevron.left" size={18} color={colors.silver} />
            </Pressable>
          ) : (
            <View style={styles.headerSide} />
          )}
          <Text style={styles.title}>{province ? province.name : "지역선택"}</Text>
          <Pressable onPress={close} hitSlop={10} style={styles.headerSide}>
            <Icon name="xmark" size={18} color={colors.silver} />
          </Pressable>
        </View>
        <View style={{ height: 2, backgroundColor: colors.whitesmoke }} />
        {province && isFetching ? (
          <Loading />
        ) : (
          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={styles.grid}>
            {list?.map(item => (
              <Pressable
                key={item.id}
                style={styles.pill}
                onPress={() => {
                  if (!province) {
                    pickProvince(item)
                  } else {
                    onSelect(`${province.name} ${item.name}`)
                    close()
                  }
                }}
              >
                <Text style={styles.pillText} numberOfLines={1}>
                  {province ? item.name : item.name.slice(0, 2)}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)" },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    minHeight: 320,
  },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 12 },
  headerSide: { width: 32, alignItems: "center" },
  title: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 16 },
  pill: {
    minWidth: 60,
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  pillText: { color: colors.white, fontSize: 14, fontWeight: "500" },
})

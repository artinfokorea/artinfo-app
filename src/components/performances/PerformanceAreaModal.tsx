import { useQuery } from "@tanstack/react-query"
import React, { useEffect, useState } from "react"
import { FlatList, KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { EmptyDataMessage, Loading } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { queries } from "@/lib/queries"
import { PERFORMANCE_AREA } from "@/types/performances"

/** 웹 components/dialog/PerformanceAreaDialog: 공연장 검색 후 선택 */
export const PerformanceAreaModal = ({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean
  onClose: () => void
  onSelect: (area: PERFORMANCE_AREA) => void
}) => {
  const [keyword, setKeyword] = useState("")
  const [debounced, setDebounced] = useState("")
  const [size, setSize] = useState(10)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(keyword.trim()), 300)
    return () => clearTimeout(timer)
  }, [keyword])

  const close = () => {
    setKeyword("")
    setDebounced("")
    setSize(10)
    onClose()
  }

  const { data, isFetching } = useQuery({
    ...queries.performances.areas({ page: 1, size, keyword: debounced }),
    enabled: !!debounced,
    placeholderData: prev => prev,
  })

  const areas = debounced ? (data?.performanceAreas ?? []) : []
  const hasNext = areas.length > 0 && areas.length < (data?.totalCount ?? 0)

  return (
    <Modal statusBarTranslucent navigationBarTranslucent visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={close}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1, padding: 20 }}>
        <View style={styles.header}>
          <Text style={styles.title}>공연장 검색</Text>
          <Pressable onPress={close} hitSlop={10}>
            <Icon name="xmark" size={18} color={colors.grayfont} />
          </Pressable>
        </View>
        <TextInput
          value={keyword}
          onChangeText={text => {
            setKeyword(text)
            setSize(10)
          }}
          autoFocus
          placeholder="공연장 이름을 입력해주세요."
          placeholderTextColor={colors.gray400}
          returnKeyType="search"
          style={styles.input}
        />
        <FlatList
          data={areas}
          keyExtractor={item => String(item.id)}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.gray600, fontSize: 15 }}>{item.name}</Text>
                <Text style={{ color: colors.gray400, fontSize: 13 }}>{item.address}</Text>
              </View>
              <Pressable
                onPress={() => {
                  onSelect(item)
                  close()
                }}
                hitSlop={8}
              >
                <Text style={{ color: "#2563eb", fontWeight: "600" }}>선택</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            isFetching ? <Loading /> : debounced ? <EmptyDataMessage /> : undefined
          }
          ListFooterComponent={
            hasNext ? (
              <Pressable style={styles.more} onPress={() => setSize(prev => prev + 10)}>
                <Text style={{ color: "#2563eb" }}>{isFetching ? "불러오는 중..." : "더보기"}</Text>
              </Pressable>
            ) : undefined
          }
        />
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "600", color: colors.gray900 },
  input: {
    marginVertical: 16,
    height: 44,
    borderWidth: 1,
    borderColor: colors.grayfont,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  more: {
    marginTop: 12,
    alignItems: "center",
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.grayfont,
    borderRadius: 4,
  },
})

import React, { useState } from "react"
import { Pressable, StyleSheet, TextInput, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

type Props = {
  value?: string
  onSubmit: (keyword: string) => void
  placeholder?: string
}

/** 웹 components/common/SearchBar — 회색 바탕의 둥근 검색창, 엔터로 검색 */
export const SearchBar = ({ value = "", onSubmit, placeholder = "검색어를 입력해주세요" }: Props) => {
  const [input, setInput] = useState(value)

  // 바깥에서 검색어가 바뀌면 입력창도 맞춘다 (렌더 중 prop 변화 반영 패턴)
  const [prevValue, setPrevValue] = useState(value)
  if (value !== prevValue) {
    setPrevValue(value)
    setInput(value)
  }

  return (
    <View style={styles.container}>
      <Icon name="magnifyingglass" size={18} color={colors.coolgray} />
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder={placeholder}
        placeholderTextColor={colors.coolgray}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit(input.trim())}
        style={styles.input}
        clearButtonMode="never"
        accessibilityLabel="검색"
      />
      {input ? (
        <Pressable
          hitSlop={8}
          accessibilityLabel="검색어 지우기"
          onPress={() => {
            setInput("")
            onSubmit("")
          }}
        >
          <Icon name="xmark" size={16} color={colors.coolgray} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, fontSize: 16, color: colors.ink },
})

import React, { useEffect, useState } from "react"
import { Pressable, StyleSheet, TextInput, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

type Props = {
  value?: string
  onSubmit: (keyword: string) => void
  placeholder?: string
}

/** 웹 components/common/ListSearchForm 과 같은 둥근 파란 테두리 검색창 */
export const SearchBar = ({
  value = "",
  onSubmit,
  placeholder = "직군, 전공, 분야 등을 검색해보세요.",
}: Props) => {
  const [input, setInput] = useState(value)

  useEffect(() => setInput(value), [value])

  return (
    <View style={styles.container}>
      <Icon name="magnifyingglass" size={18} color={colors.gray400} />
      <TextInput
        value={input}
        onChangeText={setInput}
        placeholder={placeholder}
        placeholderTextColor={colors.gray400}
        returnKeyType="search"
        onSubmitEditing={() => onSubmit(input.trim())}
        style={styles.input}
        clearButtonMode="never"
      />
      {input ? (
        <Pressable
          hitSlop={8}
          onPress={() => {
            setInput("")
            onSubmit("")
          }}
        >
          <Icon name="xmark" size={16} color={colors.gray400} />
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
    height: 44,
    borderWidth: 2,
    borderColor: colors.main,
    borderRadius: 24,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  input: { flex: 1, fontSize: 16, color: colors.black },
})

import React, { useState } from "react"
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native"

import { colors } from "@/constants/theme"

type Props = {
  initialValue?: string
  submitLabel: string
  onCancel: () => void
  onSubmit: (contents: string) => void
  /** 수정 모드에서는 내용이 바뀌어야 버튼이 활성화된다 (웹 isDirty) */
  requireChange?: boolean
}

/** 웹 CommentReplyForm / CommentCard 수정 모드의 textarea + 취소/등록 버튼 */
export const CommentEditor = ({ initialValue = "", submitLabel, onCancel, onSubmit, requireChange }: Props) => {
  const [contents, setContents] = useState(initialValue)
  const disabled = !contents.trim() || (requireChange && contents === initialValue)

  return (
    <View style={{ gap: 8, flex: 1 }}>
      <TextInput
        value={contents}
        onChangeText={setContents}
        placeholder="댓글을 남겨주세요."
        placeholderTextColor={colors.gray400}
        multiline
        autoFocus
        style={styles.input}
      />
      <View style={styles.actions}>
        <Pressable style={styles.cancel} onPress={onCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </Pressable>
        <Pressable
          style={[styles.submit, disabled && { opacity: 0.5 }]}
          disabled={disabled}
          onPress={() => onSubmit(contents.trim())}
        >
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    minHeight: 72,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: colors.black,
    textAlignVertical: "top",
  },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  cancel: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  cancelText: { color: colors.error, fontWeight: "600", fontSize: 14 },
  submit: { backgroundColor: colors.main, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  submitText: { color: colors.white, fontSize: 14 },
})

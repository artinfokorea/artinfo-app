import React, { useState } from "react"
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import { useAuth, useRequireAuth } from "@/lib/auth"

type Props = {
  onSubmit: (contents: string) => Promise<boolean>
  isLoading?: boolean
}

/** 웹 components/comments/CommentForm — 프로필 이미지 + 입력창 + 등록 버튼 */
export const CommentForm = ({ onSubmit, isLoading }: Props) => {
  const { isLoggedIn, user } = useAuth()
  const requireAuth = useRequireAuth()
  const [contents, setContents] = useState("")

  const isValid = contents.trim().length > 0

  const submit = async () => {
    if (!requireAuth() || !isValid) return
    const ok = await onSubmit(contents.trim())
    if (ok) setContents("")
  }

  return (
    <View style={styles.container}>
      <FallbackImage src={user?.iconImageUrl} style={styles.avatar} />
      {isLoggedIn ? (
        <TextInput
          value={contents}
          onChangeText={setContents}
          placeholder="댓글을 입력해주세요."
          placeholderTextColor={colors.gray400}
          multiline
          style={styles.input}
        />
      ) : (
        <Pressable style={styles.input} onPress={requireAuth}>
          <Text style={{ color: colors.gray400, fontWeight: "600", fontSize: 15 }}>
            로그인 후 이용해주세요.
          </Text>
        </Pressable>
      )}
      <Pressable
        onPress={submit}
        disabled={!isLoggedIn || !isValid || isLoading}
        style={[styles.submit, (!isLoggedIn || !isValid || isLoading) && { opacity: 0.5 }]}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.submitText}>등록</Text>
        )}
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  input: { flex: 1, fontSize: 15, color: colors.black, maxHeight: 120, justifyContent: "center", minHeight: 40 },
  submit: {
    height: 32,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.main,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: colors.white, fontSize: 12, fontWeight: "600" },
})

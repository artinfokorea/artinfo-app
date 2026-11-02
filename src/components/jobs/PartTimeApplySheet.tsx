import React, { useEffect, useState } from "react"
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

import { Button } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"

type Props = {
  visible: boolean
  onClose: () => void
  onApply: (profile: string) => void
  loading?: boolean
}

const MAX = 100

/** 웹 components/dialog/PartTimeApplyDialog: 소개(최대 100자) 입력 후 연주 신청 */
export const PartTimeApplySheet = ({ visible, onClose, onApply, loading }: Props) => {
  const [introduce, setIntroduce] = useState("")

  useEffect(() => {
    if (!visible) setIntroduce("")
  }, [visible])

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior="padding" style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>연주 신청</Text>
          <View style={styles.separator} />
          <View style={{ padding: 16, gap: 12 }}>
            <View>
              <TextInput
                value={introduce}
                onChangeText={text => setIntroduce(text.slice(0, MAX))}
                multiline
                maxLength={MAX}
                placeholder="소개"
                placeholderTextColor={colors.gray400}
                style={styles.input}
              />
              <Text style={styles.counter}>
                {introduce.length} / {MAX}
              </Text>
            </View>
            <Text style={styles.notice}>
              * 연주 신청시 본인의 프로필(학력, 전공, 연락처)이 상대방에게 전달됩니다.
            </Text>
            <View style={styles.actions}>
              <Button title="취소" variant="outline" size="sm" onPress={onClose} />
              <Button
                title="신청"
                size="sm"
                loading={loading}
                disabled={introduce.trim().length === 0}
                onPress={() => onApply(introduce)}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "center", padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 12, paddingTop: 16 },
  title: { textAlign: "center", fontSize: 16, fontWeight: "600", marginBottom: 12, color: colors.black },
  separator: { height: 2, backgroundColor: colors.whitesmoke },
  input: {
    height: 220,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 32,
    fontSize: 15,
    textAlignVertical: "top",
    color: colors.black,
  },
  counter: { position: "absolute", right: 12, bottom: 10, fontSize: 13, fontWeight: "700", color: colors.black },
  notice: { fontSize: 13, fontWeight: "500", color: colors.silver },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
})

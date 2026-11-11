import React, { useState } from "react"
import { KeyboardAvoidingView, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { Button } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"

const MAX = 50

/** 웹 components/dialog/LessonApplyDialog: 간단한 자기소개(50자) 입력 후 신청 */
export const LessonApplyModal = ({
  visible,
  loading,
  onClose,
  onApply,
}: {
  visible: boolean
  loading: boolean
  onClose: () => void
  onApply: (contents: string) => void
}) => {
  const [contents, setContents] = useState("")

  const close = () => {
    setContents("")
    onClose()
  }

  return (
    <Modal statusBarTranslucent navigationBarTranslucent visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView behavior="padding" style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.panel}>
          <Text style={styles.title}>레슨 신청</Text>
          <View style={styles.divider} />
          <View style={{ padding: 16, gap: 12 }}>
            <View>
              <TextInput
                value={contents}
                onChangeText={setContents}
                maxLength={MAX}
                multiline
                placeholder="간단한 자기소개"
                placeholderTextColor={colors.gray400}
                style={styles.input}
              />
              {contents.length > 0 ? (
                <Pressable style={styles.clear} onPress={() => setContents("")} hitSlop={8}>
                  <Icon name="xmark" size={14} color={colors.gray400} />
                </Pressable>
              ) : null}
              <Text style={styles.counter}>
                {contents.length} / {MAX}
              </Text>
            </View>
            <Text style={styles.notice}>
              * 연주 신청시 본인의 프로필(학력, 전공, 연락처)이 상대방에게 전달됩니다.
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <Button title="취소" variant="outline" size="sm" onPress={close} />
              <Button
                title="신청"
                size="sm"
                loading={loading}
                disabled={contents.length === 0}
                onPress={() => {
                  onApply(contents)
                }}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: 16,
  },
  panel: { backgroundColor: colors.white, borderRadius: 12, paddingTop: 16 },
  title: { textAlign: "center", fontSize: 16, fontWeight: "600", marginBottom: 12 },
  divider: { height: 2, backgroundColor: colors.whitesmoke },
  input: {
    height: 200,
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 30,
    fontSize: 15,
    textAlignVertical: "top",
  },
  clear: { position: "absolute", right: 12, top: 10 },
  counter: { position: "absolute", right: 14, bottom: 10, fontSize: 13, fontWeight: "700" },
  notice: { fontSize: 13, color: colors.silver, fontWeight: "500" },
})

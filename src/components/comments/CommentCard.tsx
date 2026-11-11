import React, { useState } from "react"
import { Alert, Pressable, StyleSheet, Text, View } from "react-native"

import { CommentEditor } from "@/components/comments/CommentEditor"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"
import { useModeration } from "@/hooks/useModeration"
import { useAuth, useRequireAuth } from "@/lib/auth"
import filters from "@/lib/filters"
import { COMMENT } from "@/types/comments"
import { showActionSheet } from "@/lib/action-sheet"

const filter = filters()

type Props = {
  comment: COMMENT
  isChild?: boolean
  onDelete: (id: number) => void
  onUpdate: (id: number, contents: string) => Promise<boolean>
  onReply: () => void
}

/** 웹 components/comments/CommentCard + CommentMobileMenu(⋮ 메뉴 → iOS 액션시트) */
export const CommentCard = ({ comment, isChild, onDelete, onUpdate, onReply }: Props) => {
  const { user } = useAuth()
  const requireAuth = useRequireAuth()
  const { report, block } = useModeration()
  const [isEdit, setIsEdit] = useState(false)

  const isAuthor = !!user && user.id === comment.userId

  const confirmDelete = () =>
    Alert.alert("댓글 삭제", "댓글을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: () => onDelete(comment.id) },
    ])

  const openMenu = () => {
    const actions: { label: string; destructive?: boolean; run: () => void }[] = [
      { label: "답글", run: () => requireAuth() && onReply() },
    ]
    if (isAuthor) {
      actions.push({ label: "수정", run: () => setIsEdit(true) })
      actions.push({ label: "삭제", destructive: true, run: confirmDelete })
    } else {
      actions.push({ label: "신고", run: () => report("COMMENT", comment.id) })
      actions.push({ label: "이 사용자 차단", destructive: true, run: () => block(comment.userId, comment.userNickname) })
    }

    const options = [...actions.map(a => a.label), "취소"]
    const destructiveIndex = actions.findIndex(a => a.destructive)
    showActionSheet(
      {
        options,
        cancelButtonIndex: options.length - 1,
        destructiveButtonIndex: destructiveIndex >= 0 ? destructiveIndex : undefined,
      },
      index => {
        if (index < actions.length) actions[index].run()
      },
    )
  }

  return (
    <View style={[styles.row, isChild && { marginLeft: 48 }]}>
      <FallbackImage src={comment.userIconImageUrl} style={styles.avatar} />
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.meta}>
          <Text style={styles.nickname}>{comment.userNickname}</Text>
          <Text style={styles.date}>{filter.FROM_NOW_COMMENT(comment.createdAt)}</Text>
        </View>
        {isEdit ? (
          <CommentEditor
            initialValue={comment.contents}
            submitLabel="수정"
            requireChange
            onCancel={() => setIsEdit(false)}
            onSubmit={async contents => {
              const ok = await onUpdate(comment.id, contents)
              if (ok) setIsEdit(false)
            }}
          />
        ) : (
          <Text style={styles.contents}>{comment.contents}</Text>
        )}
      </View>
      {!isEdit ? (
        <Pressable onPress={openMenu} hitSlop={10} style={{ paddingTop: 2 }} accessibilityLabel="댓글 메뉴">
          <Icon name="ellipsis" size={18} color={colors.gray600} style={{ transform: [{ rotate: "90deg" }] }} />
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12, marginVertical: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  meta: { flexDirection: "row", alignItems: "center", gap: 8 },
  nickname: { fontSize: 14, fontWeight: "600", color: colors.black },
  date: { fontSize: 11, color: colors.silver },
  contents: { fontSize: 14, color: colors.gray900, lineHeight: 20 },
})

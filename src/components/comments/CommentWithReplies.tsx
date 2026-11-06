import { useQuery } from "@tanstack/react-query"
import React, { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { CommentCard } from "@/components/comments/CommentCard"
import { CommentEditor } from "@/components/comments/CommentEditor"
import { FallbackImage } from "@/components/ui/FallbackImage"
import { colors } from "@/constants/theme"
import { useBlockedUserIds } from "@/hooks/useModeration"
import { useAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { COMMENT } from "@/types/comments"

export type CommentTargetType = "news" | "post"

type Props = {
  type: CommentTargetType
  targetId: number
  comment: COMMENT
  onDelete: (id: number) => void
  onUpdate: (id: number, contents: string) => Promise<boolean>
  onCreate: (contents: string, parentId?: number) => Promise<boolean>
}

/** 웹 components/comments/CommentWithReplies — 댓글 + 답글 목록 + 답글 입력 */
export const CommentWithReplies = ({ type, targetId, comment, onDelete, onUpdate, onCreate }: Props) => {
  const { user } = useAuth()
  const [isReplyOpen, setIsReplyOpen] = useState(false)
  const [nestedSize, setNestedSize] = useState(0)

  const enabled = comment.childrenCount > 0 && nestedSize > 0

  const { data: nestedNews } = useQuery({
    ...queries.comments.news({ newsId: targetId, page: 1, size: nestedSize, parentId: comment.id }),
    placeholderData: prev => prev,
    enabled: enabled && type === "news",
  })
  const { data: nestedPost } = useQuery({
    ...queries.comments.post({ postId: targetId, page: 1, size: nestedSize, parentId: comment.id }),
    placeholderData: prev => prev,
    enabled: enabled && type === "post",
  })

  const nested = type === "news" ? nestedNews : nestedPost
  const blockedUserIds = useBlockedUserIds()
  const visibleReplies = (nested?.comments ?? []).filter(child => !blockedUserIds.has(child.userId))
  const hasMoreReplies = comment.childrenCount > 0 && comment.childrenCount > nestedSize

  return (
    <View>
      <CommentCard
        comment={comment}
        onDelete={onDelete}
        onUpdate={onUpdate}
        onReply={() => setIsReplyOpen(true)}
      />

      {isReplyOpen ? (
        <View style={styles.replyForm}>
          <FallbackImage src={user?.iconImageUrl} style={styles.avatar} />
          <CommentEditor
            submitLabel="등록"
            onCancel={() => setIsReplyOpen(false)}
            onSubmit={async contents => {
              const ok = await onCreate(contents, comment.id)
              if (ok) {
                setIsReplyOpen(false)
                // 방금 단 답글이 보이도록 답글 목록을 펼친다
                setNestedSize(size => Math.max(size, comment.childrenCount + 1, 5))
              }
            }}
          />
        </View>
      ) : null}

      {visibleReplies.map(child => (
        <CommentCard
          key={child.id}
          comment={child}
          isChild
          onDelete={onDelete}
          onUpdate={onUpdate}
          onReply={() => setIsReplyOpen(true)}
        />
      ))}

      {hasMoreReplies ? (
        <Pressable style={{ marginLeft: 48, paddingVertical: 4 }} onPress={() => setNestedSize(size => size + 5)}>
          <Text style={styles.more}>
            {nestedSize > 0 ? "답글 더보기" : `답글 ${comment.childrenCount}개`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  replyForm: { flexDirection: "row", gap: 12, marginLeft: 48, marginVertical: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  more: { fontWeight: "700", color: colors.gray800, fontSize: 14 },
})

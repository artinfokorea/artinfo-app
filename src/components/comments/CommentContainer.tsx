import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useState } from "react"
import { View } from "react-native"

import { CommentForm } from "@/components/comments/CommentForm"
import { CommentTargetType, CommentWithReplies } from "@/components/comments/CommentWithReplies"
import { Button } from "@/components/ui/primitives"
import { useToast } from "@/components/ui/Toast"
import { queries } from "@/lib/queries"
import { createComment, deleteComment, updateComment } from "@/services/comments"
import { useBlockedUserIds } from "@/hooks/useModeration"
import { CommentPayload } from "@/interface/comments"
import { CommentType } from "@/types/comments"

type Props = {
  type: CommentTargetType
  targetId: number
}

/** 웹 components/comments/CommentContainer — 뉴스·나눔 상세 하단 댓글 영역 */
export const CommentContainer = ({ type, targetId }: Props) => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const [size, setSize] = useState(5)
  const [isLoading, setIsLoading] = useState(false)

  const { data: newsComments } = useQuery({
    ...queries.comments.news({ newsId: targetId, page: 1, size }),
    placeholderData: prev => prev,
    enabled: type === "news",
  })
  const { data: postComments } = useQuery({
    ...queries.comments.post({ postId: targetId, page: 1, size }),
    placeholderData: prev => prev,
    enabled: type === "post",
  })

  const commentList = type === "news" ? newsComments : postComments
  const blockedUserIds = useBlockedUserIds()
  const visibleComments = (commentList?.comments ?? []).filter(comment => !blockedUserIds.has(comment.userId))

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: queries.comments[type]._def })
    // 상세/목록의 댓글 수 갱신
    queryClient.invalidateQueries({ queryKey: queries[type === "post" ? "posts" : "news"]._def })
  }

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      setIsLoading(true)
      await action()
      successToast(message)
      refresh()
      return true
    } catch (error: any) {
      errorToast(error?.message ?? "요청에 실패했습니다.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = (contents: string, parentId?: number) => {
    const payload: CommentPayload = {
      contents,
      targetId,
      type: type === "news" ? CommentType.NEWS : CommentType.POST,
    }
    if (parentId) payload.parentId = parentId
    return run(() => createComment(payload), "댓글이 등록되었습니다.")
  }

  const handleUpdate = (id: number, contents: string) =>
    run(() => updateComment(id, { contents }), "댓글이 수정되었습니다.")

  const handleDelete = (id: number) => {
    run(() => deleteComment(id), "댓글이 삭제되었습니다.")
  }

  return (
    <View style={{ marginVertical: 24 }}>
      <CommentForm onSubmit={contents => handleCreate(contents)} isLoading={isLoading} />
      <View style={{ height: 12 }} />
      {visibleComments.map(comment => (
        <CommentWithReplies
          key={comment.id}
          type={type}
          targetId={targetId}
          comment={comment}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
      {(commentList?.totalCount ?? 0) > size ? (
        <Button
          title="더보기"
          variant="outline"
          size="sm"
          style={{ alignSelf: "center", marginTop: 8, borderRadius: 999, paddingHorizontal: 24 }}
          onPress={() => setSize(prev => prev + 5)}
        />
      ) : null}
    </View>
  )
}

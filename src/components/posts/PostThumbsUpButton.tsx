import React from "react"
import { Pressable, Text } from "react-native"

import { usePostLike } from "@/components/posts/usePostLike"
import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

type Props = {
  postId: number
  isLiked: boolean
  likeCount: number
  textColor?: string
}

/** 웹 components/posts/PostThumbsUpButton */
export const PostThumbsUpButton = ({ postId, isLiked, likeCount, textColor = colors.gray400 }: Props) => {
  const { handlePostLike } = usePostLike()

  return (
    <Pressable
      hitSlop={8}
      onPress={() => handlePostLike(postId, !isLiked)}
      style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
      accessibilityRole="button"
      accessibilityLabel={isLiked ? "좋아요 취소" : "좋아요"}
    >
      <Icon
        name={isLiked ? "hand.thumbsup.fill" : "hand.thumbsup"}
        size={15}
        color={isLiked ? "#ef4444" : colors.gray400}
      />
      <Text style={{ fontSize: 14, color: textColor }}>{likeCount}</Text>
    </Pressable>
  )
}

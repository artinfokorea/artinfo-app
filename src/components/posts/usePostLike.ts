import { useQueryClient } from "@tanstack/react-query"

import { useToast } from "@/components/ui/Toast"
import { useRequireAuth } from "@/lib/auth"
import { queries } from "@/lib/queries"
import { likePost } from "@/services/posts"
import { Post } from "@/types/posts"

const applyLike = (post: Post, postId: number, isLike: boolean): Post =>
  post.id === postId
    ? {
        ...post,
        isLiked: isLike,
        likeCount: isLike ? post.likeCount + 1 : Math.max(0, post.likeCount - 1),
      }
    : post

/** 웹 hooks/usePostLike 와 같은 동작: 좋아요 후 목록/상세 캐시를 즉시 갱신 */
export const usePostLike = () => {
  const queryClient = useQueryClient()
  const { successToast, errorToast } = useToast()
  const requireAuth = useRequireAuth()

  const handlePostLike = async (postId: number, isLike: boolean) => {
    if (!requireAuth()) return
    try {
      await likePost(postId, isLike)

      // 필터·검색어가 다른 모든 나눔 목록 캐시에 반영
      queryClient.setQueriesData(
        { queryKey: queries.posts.infiniteList._def },
        (old: any) =>
          old?.pages
            ? {
                ...old,
                pages: old.pages.map((page: any) => ({
                  ...page,
                  posts: page.posts.map((post: Post) => applyLike(post, postId, isLike)),
                })),
              }
            : old,
      )
      queryClient.setQueryData(queries.posts.detail(postId).queryKey, (old: any) =>
        old ? applyLike(old, postId, isLike) : old,
      )

      successToast("좋아요 성공")
    } catch {
      errorToast("좋아요 실패")
    }
  }

  return { handlePostLike }
}

import { useInfiniteQuery } from "@tanstack/react-query"
import { useCallback, useMemo, useState } from "react"

/**
 * 웹의 infiniteList 쿼리(ScrollApiResponse: { [key]: T[], nextPage, isLast, totalCount })를
 * FlatList 에 바로 꽂을 수 있게 펼쳐준다.
 *
 * const list = useInfiniteList(queries.jobs.infiniteList(filters), "jobs")
 * <FlatList data={list.items} onEndReached={list.loadMore} refreshing={list.refreshing} onRefresh={list.refresh} />
 */
export function useInfiniteList<T, K extends string>(
  query: { queryKey: readonly unknown[]; queryFn: (ctx: { pageParam: number }) => Promise<any> },
  key: K,
  options?: { enabled?: boolean },
) {
  const result = useInfiniteQuery({
    queryKey: query.queryKey,
    queryFn: ({ pageParam }) => query.queryFn({ pageParam: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => (lastPage?.isLast ? undefined : lastPage?.nextPage),
    enabled: options?.enabled ?? true,
  })

  const [refreshing, setRefreshing] = useState(false)

  const items = useMemo<T[]>(
    () => (result.data?.pages ?? []).flatMap((page: any) => (page?.[key] ?? []) as T[]),
    [result.data, key],
  )

  const totalCount: number = (result.data?.pages?.[0] as any)?.totalCount ?? 0

  const loadMore = useCallback(() => {
    if (result.hasNextPage && !result.isFetchingNextPage) result.fetchNextPage()
  }, [result])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await result.refetch()
    } finally {
      setRefreshing(false)
    }
  }, [result])

  return {
    ...result,
    items,
    totalCount,
    loadMore,
    refresh,
    refreshing,
  }
}

import { useQuery } from "@tanstack/react-query"
import { router } from "expo-router"
import React from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { EmptyDataMessage, SectionHeader, Separator } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import filters from "@/lib/filters"
import { queries } from "@/lib/queries"

const filter = filters()

const Row = ({ title, right, onPress }: { title: string; right: React.ReactNode; onPress: () => void }) => (
  <Pressable onPress={onPress} style={styles.row}>
    <Text style={styles.rowTitle} numberOfLines={1}>
      {title}
    </Text>
    <View style={styles.rowRight}>{right}</View>
  </Pressable>
)

/** 웹 components/main/PostPreview: 나눔 최신 5개 + 조회수 */
export const PostPreview = () => {
  const { data } = useQuery(queries.posts.list({ page: 1, size: 5 }))
  return (
    <View>
      <SectionHeader
        title="나눔"
        icon={<Icon name="paperplane" size={20} color={colors.black} />}
        onMore={() => router.navigate("/community?tab=posts")}
      />
      <Separator style={styles.separator} />
      <View style={styles.list}>
        {data?.posts?.length === 0 ? <EmptyDataMessage /> : null}
        {data?.posts?.map(post => (
          <Row
            key={post.id}
            title={post.title}
            onPress={() => router.push(`/posts/${post.id}`)}
            right={
              <>
                <Icon name="eye" size={15} color={colors.gray400} />
                <Text style={styles.meta}>{post.viewCount}</Text>
              </>
            }
          />
        ))}
      </View>
    </View>
  )
}

/** 웹 components/main/NewsPreview: 뉴스 최신 5개 + 날짜 */
export const NewsPreview = () => {
  const { data } = useQuery(queries.news.list({ page: 1, size: 5 }))
  return (
    <View>
      <SectionHeader
        title="뉴스"
        icon={<Icon name="newspaper" size={20} color={colors.black} />}
        onMore={() => router.navigate("/community?tab=news")}
      />
      <Separator style={styles.separator} />
      <View style={styles.list}>
        {data?.news?.length === 0 ? <EmptyDataMessage /> : null}
        {data?.news?.map(news => (
          <Row
            key={news.id}
            title={news.title}
            onPress={() => router.push(`/news/${news.id}`)}
            right={<Text style={styles.meta}>{filter.YYYYMMDD(news.createdAt, "MM.DD (ddd)")}</Text>}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  separator: { marginTop: 8, marginBottom: 16 },
  list: { gap: 20 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  rowTitle: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.gray900 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  meta: { fontSize: 14, color: colors.gray400, minWidth: 28, textAlign: "right" },
})

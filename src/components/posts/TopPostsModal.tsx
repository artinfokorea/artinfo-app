import { router } from "expo-router"
import React from "react"
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { FallbackImage } from "@/components/ui/FallbackImage"
import { Icon } from "@/components/ui/Icon"
import { EmptyDataMessage } from "@/components/ui/primitives"
import { colors } from "@/constants/theme"
import { Post } from "@/types/posts"

type Props = {
  visible: boolean
  posts?: Post[]
  onClose: () => void
}

/** 웹 components/posts/MobileTopPosts — 오른쪽에서 들어오는 Top Stories 전체 화면 */
export const TopPostsModal = ({ visible, posts, onClose }: Props) => {
  const insets = useSafeAreaInsets()

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: colors.white, paddingTop: insets.top }}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10} style={styles.back} accessibilityLabel="닫기">
            <Icon name="arrow.left" size={22} color={colors.black} />
          </Pressable>
          <Text style={styles.title}>Top Stories</Text>
        </View>
        <FlatList
          data={posts ?? []}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={<EmptyDataMessage />}
          renderItem={({ item, index }) => (
            <Pressable
              style={styles.row}
              onPress={() => {
                onClose()
                router.push(`/posts/${item.id}`)
              }}
            >
              <View style={{ flex: 1, gap: 12 }}>
                <View style={[styles.rank, index < 3 ? styles.rankTop : styles.rankNormal]}>
                  <Text style={[styles.rankText, { color: index < 3 ? colors.white : colors.main }]}>
                    TOP {index + 1}
                  </Text>
                </View>
                <View style={{ gap: 4 }}>
                  <Text style={styles.postTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.author}>{item.authorName}</Text>
                </View>
              </View>
              <FallbackImage src={item.authorIconImageUrl} style={styles.avatar} />
            </Pressable>
          )}
        />
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  back: { position: "absolute", left: 16 },
  title: { fontSize: 20, fontWeight: "700", color: colors.main },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  rank: {
    height: 22,
    width: 56,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  rankTop: { backgroundColor: colors.main },
  rankNormal: { borderWidth: 1, borderColor: colors.main, backgroundColor: colors.white },
  rankText: { fontSize: 12, fontWeight: "600" },
  postTitle: { fontSize: 14, fontWeight: "600", color: colors.black },
  author: { fontSize: 12, color: colors.gray900 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginHorizontal: 24 },
})

import React from "react"
import { Pressable, Share } from "react-native"

import { Icon } from "@/components/ui/Icon"
import { WEB_BASE_URL } from "@/constants/config"
import { colors } from "@/constants/theme"

/** 헤더 오른쪽 공유 버튼: 웹 주소(artinfokorea.com)를 공유한다 */
export const ShareButton = ({ path, title }: { path: string; title?: string }) => (
  <Pressable
    hitSlop={10}
    accessibilityLabel="공유"
    onPress={() => Share.share({ message: title ? `${title}\n${WEB_BASE_URL}${path}` : `${WEB_BASE_URL}${path}` })}
  >
    <Icon name="square.and.arrow.up" size={20} color={colors.black} />
  </Pressable>
)

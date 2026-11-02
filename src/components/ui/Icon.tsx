import { SymbolView, SymbolViewProps } from "expo-symbols"
import React from "react"
import { ColorValue, StyleProp, ViewStyle } from "react-native"

import { colors } from "@/constants/theme"

type Props = {
  /** SF Symbols 이름 (예: "magnifyingglass", "chevron.right") */
  name: SymbolViewProps["name"]
  size?: number
  color?: ColorValue
  weight?: SymbolViewProps["weight"]
  style?: StyleProp<ViewStyle>
}

/** iOS SF Symbols 아이콘. 웹의 heroicons/lucide 아이콘 자리에 쓴다. */
export const Icon = ({
  name,
  size = 20,
  color = colors.gray700,
  weight = "regular",
  style,
}: Props) => (
  <SymbolView
    name={name}
    size={size}
    tintColor={color as string}
    weight={weight}
    style={[{ width: size, height: size }, style]}
  />
)

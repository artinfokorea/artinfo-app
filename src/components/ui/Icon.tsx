import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import { SymbolView, SymbolViewProps } from "expo-symbols"
import React from "react"
import { ColorValue, Platform, StyleProp, ViewStyle } from "react-native"

import { colors } from "@/constants/theme"

/** SF Symbols 이름(문자열만 — 플랫폼별 객체 형태는 쓰지 않는다) */
export type IconName = Extract<SymbolViewProps["name"], string>

type Props = {
  /** SF Symbols 이름 (예: "magnifyingglass", "chevron.right") — Android 는 아래 표로 같은 뜻의 벡터 아이콘을 그린다 */
  name: IconName
  size?: number
  color?: ColorValue
  weight?: SymbolViewProps["weight"]
  style?: StyleProp<ViewStyle>
}

type IoniconName = React.ComponentProps<typeof Ionicons>["name"]
type MaterialName = React.ComponentProps<typeof MaterialCommunityIcons>["name"]
type AndroidIcon = { set: "ion"; name: IoniconName } | { set: "material"; name: MaterialName }

const ion = (name: IoniconName): AndroidIcon => ({ set: "ion", name })
const material = (name: MaterialName): AndroidIcon => ({ set: "material", name })

/**
 * SF Symbols → Android 아이콘 표. 앱에서 쓰는 이름은 모두 여기 있어야 한다 — 빠지면 개발 중 경고와 함께 물음표가 보인다.
 * 새 아이콘을 쓸 때는 이 표에 한 줄 추가한다.
 */
const ANDROID_ICONS: Partial<Record<string, AndroidIcon>> = {
  "apple.logo": ion("logo-apple"),
  "arrow.clockwise": ion("refresh"),
  "arrow.up": ion("arrow-up"),
  "bell.badge": ion("notifications-outline"),
  bold: material("format-bold"),
  "book.fill": ion("book"),
  "briefcase.fill": ion("briefcase"),
  calendar: ion("calendar-outline"),
  camera: ion("camera-outline"),
  "camera.fill": ion("camera"),
  checkmark: ion("checkmark"),
  "checkmark.circle.fill": ion("checkmark-circle"),
  "chevron.left": ion("chevron-back"),
  "chevron.right": ion("chevron-forward"),
  circle: ion("ellipse-outline"),
  clock: ion("time-outline"),
  ellipsis: ion("ellipsis-horizontal"),
  envelope: ion("mail-outline"),
  eye: ion("eye-outline"),
  graduationcap: ion("school-outline"),
  "graduationcap.fill": ion("school"),
  "hand.thumbsup": ion("thumbs-up-outline"),
  "hand.thumbsup.fill": ion("thumbs-up"),
  "house.fill": ion("home"),
  italic: material("format-italic"),
  "line.3.horizontal": ion("menu"),
  "line.3.horizontal.decrease": ion("filter-outline"),
  "list.bullet": material("format-list-bulleted"),
  "list.number": material("format-list-numbered"),
  lock: ion("lock-closed-outline"),
  magnifyingglass: ion("search"),
  map: ion("map-outline"),
  message: ion("chatbubble-outline"),
  newspaper: ion("newspaper-outline"),
  "newspaper.fill": ion("newspaper"),
  paperplane: ion("paper-plane-outline"),
  pencil: ion("pencil"),
  "person.crop.circle": ion("person-circle-outline"),
  "person.crop.circle.badge.minus": ion("person-remove-outline"),
  phone: ion("call-outline"),
  photo: ion("image-outline"),
  plus: ion("add"),
  "rectangle.portrait.and.arrow.right": ion("log-out-outline"),
  rosette: ion("ribbon-outline"),
  "square.and.arrow.up": ion("share-outline"),
  "square.and.pencil": ion("create-outline"),
  "text.quote": material("format-quote-close"),
  trash: ion("trash-outline"),
  underline: material("format-underline"),
  xmark: ion("close"),
}

const warned = new Set<string>()

/** iOS 는 SF Symbols, Android 는 Ionicons/Material 아이콘. 웹의 heroicons/lucide 아이콘 자리에 쓴다. */
export const Icon = ({
  name,
  size = 20,
  color = colors.gray700,
  weight = "regular",
  style,
}: Props) => {
  if (Platform.OS !== "ios") {
    const icon = ANDROID_ICONS[name]
    if (!icon) {
      if (__DEV__ && !warned.has(name)) {
        warned.add(name)
        console.warn(`[Icon] Android 아이콘 표에 "${name}" 이 없습니다 — components/ui/Icon.tsx 에 추가하세요.`)
      }
      return <Ionicons name="help-circle-outline" size={size} color={color as string} style={style as any} />
    }
    // 벡터 아이콘은 SF Symbols 보다 글리프가 조금 작게 그려져서 살짝 키워 시각적 크기를 맞춘다
    const vectorSize = Math.round(size * 1.1)
    return icon.set === "ion" ? (
      <Ionicons name={icon.name} size={vectorSize} color={color as string} style={style as any} />
    ) : (
      <MaterialCommunityIcons name={icon.name} size={vectorSize} color={color as string} style={style as any} />
    )
  }
  return (
    <SymbolView
      name={name}
      size={size}
      tintColor={color as string}
      weight={weight}
      style={[{ width: size, height: size }, style]}
    />
  )
}

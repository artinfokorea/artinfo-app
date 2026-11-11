import { ActionSheetIOS, Platform } from "react-native"

export type ActionSheetOptions = {
  /** 마지막 항목은 보통 '취소' — cancelButtonIndex 로 가리킨다 */
  options: string[]
  cancelButtonIndex?: number
  destructiveButtonIndex?: number
  title?: string
}

export type ActionSheetRequest = ActionSheetOptions & { onSelect: (index: number) => void }

type Listener = (request: ActionSheetRequest | null) => void
let listener: Listener | null = null

/** Android 시트(components/ui/ActionSheet 의 ActionSheetHost)가 마운트될 때 등록한다 */
export const setActionSheetListener = (next: Listener | null) => {
  listener = next
}

/**
 * 선택 메뉴를 띄운다 — iOS 는 시스템 액션시트, Android 는 앱 안의 하단 시트(ActionSheetHost).
 * 콜백에는 고른 항목의 인덱스가 오고, 취소하면 cancelButtonIndex(없으면 -1)가 온다.
 */
export const showActionSheet = (options: ActionSheetOptions, onSelect: (index: number) => void) => {
  if (Platform.OS === "ios") {
    ActionSheetIOS.showActionSheetWithOptions(options, onSelect)
    return
  }
  if (!listener) {
    if (__DEV__) console.warn("[action-sheet] ActionSheetHost 가 마운트되지 않았습니다.")
    return
  }
  listener({ ...options, onSelect })
}

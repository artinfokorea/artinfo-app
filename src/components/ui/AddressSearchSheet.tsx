import React from "react"
import { Modal, Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { WebView, WebViewMessageEvent } from "react-native-webview"

import { Icon } from "@/components/ui/Icon"
import { colors } from "@/constants/theme"

export type PostcodeResult = {
  /** 웹의 react-daum-postcode onComplete 에서 쓰는 값 (data.address) */
  address: string
  roadAddress: string
  jibunAddress: string
  zonecode: string
}

type Props = {
  visible: boolean
  onClose: () => void
  onSelect: (result: PostcodeResult) => void
}

const HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>html, body, #wrap { margin: 0; padding: 0; width: 100%; height: 100%; }</style>
<script src="https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"></script>
</head><body><div id="wrap"></div>
<script>
  new daum.Postcode({
    width: '100%',
    height: '100%',
    oncomplete: function (data) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        address: data.address,
        roadAddress: data.roadAddress,
        jibunAddress: data.jibunAddress,
        zonecode: data.zonecode
      }));
    }
  }).embed(document.getElementById('wrap'));
</script></body></html>`

/** 웹 components/dialog/PostCodeDialog (react-daum-postcode) 대체 — 다음 우편번호 검색 */
export const AddressSearchSheet = ({ visible, onClose, onSelect }: Props) => {
  const insets = useSafeAreaInsets()

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const result = JSON.parse(event.nativeEvent.data) as PostcodeResult
      if (result?.address) {
        onSelect(result)
        onClose()
      }
    } catch {
      // ignore
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top - 40, 12) }]}>
        <Text style={styles.title}>주소 검색</Text>
        <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="닫기">
          <Icon name="xmark" size={18} color={colors.gray500} />
        </Pressable>
      </View>
      <WebView
        originWhitelist={["*"]}
        source={{ html: HTML, baseUrl: "https://artinfokorea.com" }}
        onMessage={onMessage}
        style={{ flex: 1 }}
      />
    </Modal>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  title: { fontSize: 18, fontWeight: "700", color: colors.black },
})

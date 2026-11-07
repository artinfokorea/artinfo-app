import React, { useState } from "react"
import { ActivityIndicator, Linking, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native"
import { WebView, WebViewMessageEvent } from "react-native-webview"

import { KAKAO_JAVASCRIPT_KEY, WEB_BASE_URL } from "@/constants/config"
import { colors } from "@/constants/theme"

type Props = {
  latitude: number
  longitude: number
  label: string
  style?: StyleProp<ViewStyle>
}

/**
 * 웹 components/common/KakaoMap 과 같은 카카오 지도 — WebView 에 Kakao Maps JS SDK 를 띄운다.
 * JavaScript 키는 등록된 도메인에서만 동작하므로 baseUrl 을 artinfokorea.com 으로 둔다 (주소 검색 시트와 같은 방식).
 */
const buildHtml = (latitude: number, longitude: number, label: string) => `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<style>html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #F2F4F6; }</style>
<script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&autoload=false"></script>
</head><body><div id="map"></div>
<script>
  var post = function (type) { window.ReactNativeWebView && window.ReactNativeWebView.postMessage(type) }
  try {
    kakao.maps.load(function () {
      var center = new kakao.maps.LatLng(${latitude}, ${longitude})
      var map = new kakao.maps.Map(document.getElementById('map'), { center: center, level: 4 })
      new kakao.maps.Marker({ map: map, position: center, title: ${JSON.stringify(label)} })
      post('ready')
    })
  } catch (e) { post('error') }
  window.addEventListener('error', function () { post('error') })
</script></body></html>`

export const KakaoMapView = ({ latitude, longitude, label, style }: Props) => {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")
  const kakaoMapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(label)},${latitude},${longitude}`

  const onMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === "ready") setState("ready")
    if (event.nativeEvent.data === "error") setState("error")
  }

  if (!KAKAO_JAVASCRIPT_KEY || state === "error") {
    return (
      <View style={[styles.container, styles.fallback, style]}>
        <Text style={styles.fallbackText}>지도를 불러오지 못했습니다.</Text>
        <Pressable onPress={() => Linking.openURL(kakaoMapUrl)} hitSlop={8}>
          <Text style={styles.fallbackLink}>카카오맵에서 보기</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: buildHtml(latitude, longitude, label), baseUrl: WEB_BASE_URL }}
        onMessage={onMessage}
        onError={() => setState("error")}
        scrollEnabled={false}
        bounces={false}
        style={styles.webview}
      />
      {state === "loading" ? (
        <View style={styles.loading} pointerEvents="none">
          <ActivityIndicator color={colors.main} />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 9 / 4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surface2,
  },
  webview: { flex: 1, backgroundColor: "transparent" },
  loading: { ...StyleSheet.absoluteFill, alignItems: "center", justifyContent: "center" },
  fallback: { alignItems: "center", justifyContent: "center", gap: 6 },
  fallbackText: { fontSize: 14, color: colors.grayfont },
  fallbackLink: { fontSize: 14, fontWeight: "700", color: colors.main },
})

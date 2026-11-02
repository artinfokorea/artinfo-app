import * as WebBrowser from "expo-web-browser"
import React, { useMemo, useState } from "react"
import { StyleProp, ViewStyle } from "react-native"
import { WebView, WebViewMessageEvent } from "react-native-webview"

import { WEB_BASE_URL } from "@/constants/config"

type Props = {
  html: string
  style?: StyleProp<ViewStyle>
  /** 본문 기본 글자 크기 */
  fontSize?: number
}

/**
 * 서버가 내려주는 HTML 본문(CKEditor 로 작성된 공고·뉴스·글 등)을 보여준다.
 * 높이는 내용에 맞춰 자동으로 늘어나고, 링크는 인앱 브라우저로 연다.
 */
export const HtmlContent = ({ html, style, fontSize = 16 }: Props) => {
  const [height, setHeight] = useState(1)

  const source = useMemo(
    () => ({
      baseUrl: WEB_BASE_URL,
      html: `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  body { font-family: -apple-system, "Apple SD Gothic Neo", sans-serif; font-size: ${fontSize}px;
         line-height: 1.6; color: #111827; word-break: break-word; overflow-wrap: anywhere; }
  img, video, iframe { max-width: 100% !important; height: auto !important; }
  figure { margin: 8px 0; }
  figure.image { text-align: center; }
  table { max-width: 100%; border-collapse: collapse; display: block; overflow-x: auto; }
  td, th { border: 1px solid #e5e7eb; padding: 4px 6px; }
  a { color: #6366f1; text-decoration: underline; text-underline-offset: 2px; }
  p { margin: 0 0 8px; }
  blockquote { margin: 8px 0; padding-left: 12px; border-left: 4px solid #e5e7eb; color: #4b5563; }
</style></head>
<body><div id="content">${html ?? ""}</div>
<script>
  function post() {
    window.ReactNativeWebView.postMessage(String(document.getElementById('content').scrollHeight));
  }
  new ResizeObserver(post).observe(document.getElementById('content'));
  document.querySelectorAll('img').forEach(function (img) { img.addEventListener('load', post); });
  window.addEventListener('load', post);
  post();
</script></body></html>`,
    }),
    [html, fontSize],
  )

  const onMessage = (event: WebViewMessageEvent) => {
    const next = Number(event.nativeEvent.data)
    if (Number.isFinite(next) && next > 0) setHeight(next)
  }

  return (
    <WebView
      originWhitelist={["*"]}
      source={source}
      onMessage={onMessage}
      scrollEnabled={false}
      style={[{ height, backgroundColor: "transparent" }, style]}
      onShouldStartLoadWithRequest={request => {
        // 최초 로드(about:blank/baseUrl)만 허용하고, 사용자가 누른 링크는 브라우저로 연다.
        if (request.navigationType === "click") {
          WebBrowser.openBrowserAsync(request.url)
          return false
        }
        return true
      }}
    />
  )
}

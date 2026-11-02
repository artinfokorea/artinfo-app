import React, { useMemo, useRef, useState } from "react"
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { WebView, WebViewMessageEvent } from "react-native-webview"

import { Icon } from "@/components/ui/Icon"
import { pickAndUploadImage } from "@/components/ui/ImagePickerField"
import { useToast } from "@/components/ui/Toast"
import { colors } from "@/constants/theme"
import { UploadTarget } from "@/types"

type Props = {
  label?: string
  /** 처음 보여줄 HTML (수정 화면) */
  initialHtml?: string
  onChange: (html: string) => void
  placeholder?: string
  uploadTarget?: UploadTarget
  minHeight?: number
  error?: string
}

const COMMANDS: { key: string; icon?: any; text?: string; command: string; arg?: string }[] = [
  { key: "bold", icon: "bold", command: "bold" },
  { key: "italic", icon: "italic", command: "italic" },
  { key: "underline", icon: "underline", command: "underline" },
  { key: "h2", text: "H", command: "formatBlock", arg: "H2" },
  { key: "p", text: "본문", command: "formatBlock", arg: "P" },
  { key: "ul", icon: "list.bullet", command: "insertUnorderedList" },
  { key: "ol", icon: "list.number", command: "insertOrderedList" },
  { key: "quote", icon: "text.quote", command: "formatBlock", arg: "BLOCKQUOTE" },
]

/**
 * 웹의 CKEditor 대체. WebView contenteditable 기반의 간단한 리치 에디터로 HTML 을 만든다.
 * 서버에는 웹과 똑같이 HTML 문자열(contents)을 보낸다.
 */
export const RichEditor = ({
  label,
  initialHtml = "",
  onChange,
  placeholder = "내용을 입력해주세요.",
  uploadTarget = UploadTarget.JOB,
  minHeight = 280,
  error,
}: Props) => {
  const webview = useRef<any>(null)
  const [height, setHeight] = useState(minHeight)
  const [uploading, setUploading] = useState(false)
  const { errorToast } = useToast()

  // initialHtml 은 최초 1회만 반영한다 (입력 중 리렌더로 커서가 튀지 않도록)
  const source = useMemo(
    () => ({
      html: `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
  html, body { margin: 0; padding: 0; }
  #editor { min-height: ${minHeight - 24}px; padding: 12px; outline: none; font-family: -apple-system, sans-serif;
            font-size: 16px; line-height: 1.6; color: #111827; word-break: break-word; }
  #editor:empty:before { content: attr(data-placeholder); color: #9ca3af; }
  img { max-width: 100%; height: auto; }
  blockquote { margin: 8px 0; padding-left: 12px; border-left: 4px solid #e5e7eb; color: #4b5563; }
  h2 { font-size: 20px; margin: 8px 0; }
  p { margin: 0 0 8px; }
</style></head><body>
<div id="editor" contenteditable="true" data-placeholder="${placeholder.replace(/"/g, "&quot;")}"></div>
<script>
  var editor = document.getElementById('editor');
  editor.innerHTML = ${JSON.stringify(initialHtml)};
  function send() {
    var html = editor.innerHTML === '<br>' ? '' : editor.innerHTML;
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'change', html: html, height: document.body.scrollHeight }));
  }
  editor.addEventListener('input', send);
  new ResizeObserver(send).observe(editor);
  window.exec = function (cmd, arg) { editor.focus(); document.execCommand(cmd, false, arg || null); send(); };
  window.insertImage = function (url) {
    editor.focus();
    document.execCommand('insertHTML', false, '<figure class="image"><img src="' + url + '"></figure><p><br></p>');
    send();
  };
  send();
</script></body></html>`,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === "change") {
        onChange(data.html)
        setHeight(Math.max(minHeight, data.height))
      }
    } catch {
      // ignore
    }
  }

  const run = (command: string, arg?: string) => {
    webview.current?.injectJavaScript(
      `window.exec(${JSON.stringify(command)}, ${JSON.stringify(arg ?? null)}); true;`,
    )
  }

  const insertImage = async () => {
    try {
      setUploading(true)
      const url = await pickAndUploadImage(uploadTarget)
      if (url) {
        webview.current?.injectJavaScript(`window.insertImage(${JSON.stringify(url)}); true;`)
      }
    } catch {
      errorToast("이미지 업로드에 실패했습니다.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.container, !!error && { borderColor: colors.error }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.toolbar}
          contentContainerStyle={{ alignItems: "center", paddingHorizontal: 4 }}
          keyboardShouldPersistTaps="always"
        >
          {COMMANDS.map(item => (
            <Pressable key={item.key} style={styles.tool} onPress={() => run(item.command, item.arg)}>
              {item.icon ? (
                <Icon name={item.icon} size={17} color={colors.gray700} />
              ) : (
                <Text style={{ fontWeight: "700", color: colors.gray700 }}>{item.text}</Text>
              )}
            </Pressable>
          ))}
          <Pressable style={styles.tool} onPress={insertImage} disabled={uploading}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.main} />
            ) : (
              <Icon name="photo" size={18} color={colors.gray700} />
            )}
          </Pressable>
        </ScrollView>
        <WebView
          ref={webview}
          originWhitelist={["*"]}
          source={source}
          onMessage={onMessage}
          scrollEnabled={false}
          hideKeyboardAccessoryView
          keyboardDisplayRequiresUserAction={false}
          style={{ height, backgroundColor: "transparent" }}
        />
      </View>
      {error ? <Text style={{ color: colors.error, fontSize: 13 }}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: "600", color: colors.gray800 },
  container: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.white,
  },
  toolbar: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  tool: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
})

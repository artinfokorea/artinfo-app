import React, { createContext, useCallback, useContext, useRef, useState } from "react"
import { Animated, StyleSheet, Text } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { colors } from "@/constants/theme"

type ToastType = "success" | "error"
type ToastApi = {
  successToast: (message: string) => void
  errorToast: (message: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

/** 웹의 react-hot-toast(useToast) 대체 */
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets()
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const opacity = useRef(new Animated.Value(0)).current
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(
    (message: string, type: ToastType) => {
      if (timer.current) clearTimeout(timer.current)
      setToast({ message, type })
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start()
      timer.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(
          () => setToast(null),
        )
      }, 2200)
    },
    [opacity],
  )

  const api = React.useMemo(
    () => ({
      successToast: (message: string) => show(message, "success"),
      errorToast: (message: string) => show(message, "error"),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.toast, { top: insets.top + 8, opacity }]}
        >
          <Text style={[styles.icon, { color: toast.type === "success" ? colors.green : colors.error }]}>
            {toast.type === "success" ? "✓" : "!"}
          </Text>
          <Text style={styles.text}>{toast.message}</Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used inside ToastProvider")
  return context
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    alignSelf: "center",
    maxWidth: "90%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 9999,
  },
  icon: { fontWeight: "900", fontSize: 16 },
  text: { fontSize: 15, color: colors.gray900, flexShrink: 1 },
})

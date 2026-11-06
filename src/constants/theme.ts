/** 웹(tailwind.config.ts)의 커스텀 색상을 그대로 옮긴 팔레트 */
export const colors = {
  main: "#0064FF",
  error: "#EA2A2A",
  green: "#449F3C",
  kakao: "#FEE500",
  naver: "#03C75A",
  white: "#FFFFFF",
  black: "#000000",
  primary: "#34363D",
  whitesmoke: "#F0F0F0",
  lightgray: "#D1D6DB",
  coolgray: "#8B95A1",
  badge: "#f2f4f7",
  silver: "#b5b6b9",
  dimgray: "#656667",
  darkgray: "#a4a5a7",
  aliceblue: "#f1f4ff",
  lavender: "#d4e1f3",
  salomon: "#ff6c6a",
  seashell: "#fff2ee",
  limegreen: "#11b143",
  skyblue: "#7493FF",
  grayfont: "#bdbdbd",
  // tailwind 기본 gray 스케일 (웹에서 text-gray-400 등으로 사용)
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  indigo500: "#6366f1",
  // 웹 목록 페이지 개편(2026-11)에서 쓰는 중립 톤 — tailwind 임의 색상값 그대로
  ink: "#191F28",
  ink2: "#333D4B",
  ink3: "#4E5968",
  muted: "#6B7684",
  line: "#E5E8EB",
  line2: "#EEF0F3",
  surface: "#F2F4F6",
  surface2: "#F7F8FA",
  tagBg: "#E8F3FF",
  tagText: "#1B64DA",
} as const

export const spacing = {
  screen: 16, // 웹의 px-4
}

/** tailwind 의 text-xs ~ text-2xl 크기 */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
} as const

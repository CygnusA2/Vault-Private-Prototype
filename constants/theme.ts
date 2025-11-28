import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#FFFFFF",
    textSecondary: "#A0A8B8",
    textTertiary: "#6B7280",
    buttonText: "#0A0E14",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#C9A961",
    link: "#C9A961",
    primary: "#C9A961",
    primaryDark: "#A68947",
    primaryLight: "#E5D4A8",
    backgroundRoot: "#0A0E14",
    backgroundDefault: "#1A1F2E",
    backgroundSecondary: "#252B3A",
    backgroundTertiary: "#2D3548",
    border: "#2D3548",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
  dark: {
    text: "#FFFFFF",
    textSecondary: "#A0A8B8",
    textTertiary: "#6B7280",
    buttonText: "#0A0E14",
    tabIconDefault: "#6B7280",
    tabIconSelected: "#C9A961",
    link: "#C9A961",
    primary: "#C9A961",
    primaryDark: "#A68947",
    primaryLight: "#E5D4A8",
    backgroundRoot: "#0A0E14",
    backgroundDefault: "#1A1F2E",
    backgroundSecondary: "#252B3A",
    backgroundTertiary: "#2D3548",
    border: "#2D3548",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    info: "#3B82F6",
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  inputHeight: 48,
  buttonHeight: 52,
};

export const BorderRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 30,
  "2xl": 40,
  "3xl": 50,
  full: 9999,
};

export const Typography = {
  display: {
    fontSize: 32,
    fontWeight: "700" as const,
  },
  h1: {
    fontSize: 28,
    fontWeight: "600" as const,
  },
  h2: {
    fontSize: 24,
    fontWeight: "600" as const,
  },
  h3: {
    fontSize: 20,
    fontWeight: "600" as const,
  },
  h4: {
    fontSize: 17,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  bodyLarge: {
    fontSize: 17,
    fontWeight: "400" as const,
  },
  small: {
    fontSize: 13,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: 11,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 15,
    fontWeight: "400" as const,
  },
  financial: {
    fontSize: 28,
    fontWeight: "600" as const,
    fontFamily: Platform.select({
      ios: "ui-monospace",
      default: "monospace",
    }),
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

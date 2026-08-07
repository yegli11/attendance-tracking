export const BREAKPOINTS = {
  tablet: 640,
  desktop: 960,
} as const

export type BreakpointName = keyof typeof BREAKPOINTS

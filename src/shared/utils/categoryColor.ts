export interface CategoryColor {
  main: string
  bg: string
  dark: string
}

// Keyed by known category names (see supabase/migrations seed data). Any category
// outside this set (e.g. "Todas las edades") falls back to DEFAULT_COLOR.
const PALETTE: Record<string, CategoryColor> = {
  niños: { main: '#FF6B57', bg: '#FFF0EC', dark: '#C43F2C' },
  adultos: { main: '#7B3FF2', bg: '#F1ECFE', dark: '#4B1F9E' },
  jóvenes: { main: '#12968F', bg: '#E6F7F6', dark: '#0A5C58' },
}

const DEFAULT_COLOR: CategoryColor = { main: '#D69E2E', bg: '#FFF6E5', dark: '#8A5B00' }

export function getCategoryColor(categoryName: string): CategoryColor {
  return PALETTE[categoryName.trim().toLowerCase()] ?? DEFAULT_COLOR
}

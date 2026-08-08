// Only child-oriented categories require an authorized representative at registration.
export function categoryRequiresRepresentative(categoryName: string): boolean {
  return categoryName.trim().toLowerCase().includes('niñ')
}

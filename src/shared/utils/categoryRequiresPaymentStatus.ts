// Only the adults category tracks a payment status at registration.
export function categoryRequiresPaymentStatus(categoryName: string): boolean {
  return categoryName.trim().toLowerCase().includes('adulto')
}
